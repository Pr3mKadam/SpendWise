import Peer, { DataConnection } from 'peerjs';

export type SyncState = 'disconnected' | 'connecting' | 'connected';

export class SyncEngine {
  public peer: Peer | null = null;
  public connections: Map<string, DataConnection> = new Map();
  public localPeerId: string = '';
  
  private onDataCallback: ((data: any) => void) | null = null;
  private onStateChangeCallback: ((state: SyncState, connectedPeers: number) => void) | null = null;

  constructor() {
    this.localPeerId = this.getStoredPeerId();
  }

  private getStoredPeerId(): string {
    let id = localStorage.getItem('spendwise_peer_id');
    if (!id) {
      id = 'sw-' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('spendwise_peer_id', id);
    }
    return id;
  }

  public init() {
    if (this.peer) return;

    this.notifyState('connecting');
    this.peer = new Peer(this.localPeerId, {
      debug: 1, // Only errors
    });

    this.peer.on('open', (id) => {
      this.localPeerId = id;
      this.notifyState('connected');
    });

    this.peer.on('connection', (conn) => {
      this.setupConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      // Fallback state logic
      this.notifyState('disconnected');
    });
    
    this.peer.on('disconnected', () => {
      this.notifyState('disconnected');
    });
  }

  public connect(remotePeerId: string) {
    if (!this.peer) this.init();
    if (this.connections.has(remotePeerId) || remotePeerId === this.localPeerId) return;

    const conn = this.peer!.connect(remotePeerId, { reliable: true });
    this.setupConnection(conn);
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.notifyState('connected');
      
      // Request initial sync by sending an empty sync signal
      // Actually, we should just let the useSharedWallets trigger a full broadcast upon connection
    });

    conn.on('data', (data) => {
      if (this.onDataCallback) {
        this.onDataCallback(data);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.notifyState(this.connections.size > 0 ? 'connected' : 'disconnected');
    });
    
    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.connections.delete(conn.peer);
      this.notifyState(this.connections.size > 0 ? 'connected' : 'disconnected');
    });
  }

  public broadcast(data: any) {
    const payload = JSON.stringify(data);
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  public onData(cb: (data: any) => void) {
    this.onDataCallback = cb;
  }

  public onStateChange(cb: (state: SyncState, connectedPeers: number) => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyState(state: SyncState) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state, this.connections.size);
    }
  }

  public destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.notifyState('disconnected');
  }
}

export const syncEngine = new SyncEngine();
