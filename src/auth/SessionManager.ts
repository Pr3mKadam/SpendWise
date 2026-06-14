import type { AuthSession, TokenRotationResult } from './types';
import { deviceManager } from './DeviceManager';

const SESSION_KEY = 'sw_current_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh if within 5 min of expiry

export class SessionManager {
  private session: AuthSession | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthSession;
        if (Date.now() < parsed.expiresAt) {
          this.session = parsed;
          return;
        }
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // silently ignore — non-critical
      sessionStorage.removeItem(SESSION_KEY);
    }
    this.session = null;
  }

  private persist(): void {
    if (this.session) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      } catch { /* silently ignore — non-critical */ }
    }
  }

  private clear(): void {
    this.session = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch { /* silently ignore — non-critical */ }
  }

  initSession(accessToken: string, refreshToken: string, expiresIn: number): AuthSession {
    const session: AuthSession = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      deviceId: deviceManager.getCurrentDeviceId(),
      mfaVerified: false,
    };
    this.session = session;
    this.persist();
    this.startRefreshTimer();
    return session;
  }

  markMfaVerified(): void {
    if (this.session) {
      this.session.mfaVerified = true;
      this.persist();
    }
  }

  getSession(): AuthSession | null {
    if (!this.session) return null;
    if (Date.now() >= this.session.expiresAt) {
      this.destroy();
      return null;
    }
    return this.session;
  }

  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.getSession()?.refreshToken ?? null;
  }

  isSessionExpired(): boolean {
    if (!this.session) return true;
    return Date.now() >= this.session.expiresAt;
  }

  needsRefresh(): boolean {
    if (!this.session) return false;
    return Date.now() >= this.session.expiresAt - REFRESH_MARGIN_MS;
  }

  isMfaVerified(): boolean {
    return this.session?.mfaVerified ?? false;
  }

  async rotateTokens(
    refreshFn: (refreshToken: string) => Promise<TokenRotationResult | null>
  ): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const result = await refreshFn(refreshToken);
    if (!result) {
      this.destroy();
      return false;
    }

    this.session = {
      ...this.session!,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
    };
    this.persist();
    return true;
  }

  private startRefreshTimer(): void {
    this.stopRefreshTimer();
    this.refreshTimer = setInterval(() => {
      if (this.needsRefresh()) {
        this.emitRefreshNeeded();
      }
    }, 60_000);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private refreshHandlers: Array<() => void> = [];
  onRefreshNeeded(handler: () => void): () => void {
    this.refreshHandlers.push(handler);
    return () => {
      this.refreshHandlers = this.refreshHandlers.filter(h => h !== handler);
    };
  }

  private emitRefreshNeeded(): void {
    for (const handler of this.refreshHandlers) {
      handler();
    }
  }

  destroy(): void {
    this.stopRefreshTimer();
    this.clear();
  }

  getSessionDuration(): number {
    if (!this.session) return 0;
    return this.session.expiresAt - Date.now();
  }

  static getSessionTTL(): number {
    return SESSION_TTL_MS;
  }
}

export const sessionManager = new SessionManager();
