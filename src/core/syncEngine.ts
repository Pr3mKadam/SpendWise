/**
 * syncEngine.ts — Supabase Realtime P2P sync
 *
 * REPLACES the PeerJS implementation entirely.
 * PeerJS relies on a public signaling server (0.peerjs.com) that is
 * frequently blocked in India and overloaded globally.
 *
 * Supabase Realtime uses WebSockets through our own Supabase project —
 * same domain, already authenticated, no third-party dependency.
 *
 * ARCHITECTURE:
 *   • Each SpendWise client joins a Supabase Realtime channel named
 *     "shared-wallet:{groupId}" when a group is selected.
 *   • Mutations are broadcast to all other clients in the same channel.
 *   • CRDT merge handles conflicts — same as before.
 *   • localPeerId is kept for backward compat (= Supabase socket ID).
 */

import { joinRoom, Room } from '@trystero-p2p/mqtt';

export type SyncState = 'disconnected' | 'connecting' | 'connected';

type DataCallback = (data: any) => void;
type StateCallback = (state: SyncState, peers: number) => void;

class SyncEngine {
  public localPeerId: string = '';
  private room: Room | null = null;
  private currentGroupId: string = '';
  private peers = new Set<string>();
  private localChannel: BroadcastChannel | null = null;

  private onDataCb: DataCallback | null = null;
  private onStateCb: StateCallback | null = null;
  private sendSyncData: ((data: any) => void) | null = null;

  constructor() {
    let id = localStorage.getItem('spendwise_peer_id');
    if (!id) {
      id = 'sw-' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('spendwise_peer_id', id);
    }
    this.localPeerId = id;
  }

  public init() {
    this.notifyState('disconnected');
  }

  public joinGroup(groupId: string) {
    if (!groupId) {
      this.leaveChannel();
      return;
    }

    if (groupId === this.currentGroupId && this.room) return;

    this.leaveChannel();
    this.currentGroupId = groupId;
    this.notifyState('connecting');

    // ── Local Cross-Tab Sync via BroadcastChannel ──
    try {
      this.localChannel = new BroadcastChannel(`spendwise-local-sync-${groupId}`);
      this.localChannel.onmessage = event => {
        // Skip messages sent from ourselves
        if (event.data?.senderId === this.localPeerId) return;
        if (this.onDataCb && event.data?.payload) {
          this.onDataCb(event.data.payload);
        }
      };
    } catch (e) {
      console.warn('[SyncEngine] BroadcastChannel failed (probably unsupported environment):', e);
    }

    // ── Global P2P Sync via MQTT WebRTC ──
    try {
      // Use secure WebSockets on public brokers for discovery/signaling with fallback support
      this.room = joinRoom(
        {
          appId: 'spendwise-p2p-sync',
          relayConfig: {
            urls: ['wss://broker.hivemq.com:8884/mqtt', 'wss://broker.emqx.io:8084/mqtt'],
          },
          rtcConfig: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          },
        },
        `shared-wallet-${groupId}`,
        {
          onJoinError: err => {
            console.error('[SyncEngine] Failed to connect to signaling broker:', err);
            this.notifyState('disconnected');
          },
        }
      );

      const syncAction = this.room.makeAction('sw-sync');
      this.sendSyncData = syncAction.send;

      this.room.onPeerJoin = (peerId: string) => {
        this.peers.add(peerId);
        this.notifyState('connected');
      };

      this.room.onPeerLeave = (peerId: string) => {
        this.peers.delete(peerId);
        this.notifyState('connected');
      };

      syncAction.onMessage = (data: any, context: any) => {
        if (this.onDataCb) this.onDataCb(data);
      };

      this.notifyState('connected');
    } catch (e) {
      console.error('[SyncEngine] Failed to initialize MQTT room:', e);
      this.notifyState('disconnected');
    }
  }

  public broadcast(data: any) {
    // 1. Broadcast globally via WebRTC
    if (this.room && this.sendSyncData) {
      try {
        this.sendSyncData(data);
      } catch (e) {
        console.warn('[SyncEngine] WebRTC broadcast failed:', e);
      }
    }

    // 2. Broadcast locally to other tabs
    if (this.localChannel) {
      try {
        this.localChannel.postMessage({
          senderId: this.localPeerId,
          payload: data,
        });
      } catch (e) {
        console.warn('[SyncEngine] BroadcastChannel send failed:', e);
      }
    }
  }

  public connect(remotePeerId: string) {
    console.info('[SyncEngine] Manual connect not needed with Trystero rooms');
  }

  public onData(cb: DataCallback) {
    this.onDataCb = cb;
  }

  public onStateChange(cb: StateCallback) {
    this.onStateCb = cb;
  }

  public get connectedPeers(): number {
    return this.peers.size;
  }

  private leaveChannel() {
    if (this.room) {
      this.room.leave();
      this.room = null;
      this.sendSyncData = null;
    }
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    this.peers.clear();
    this.currentGroupId = '';
    this.notifyState('disconnected');
  }

  private notifyState(state: SyncState) {
    this.onStateCb?.(state, this.connectedPeers);
  }
}

export const syncEngine = new SyncEngine();
