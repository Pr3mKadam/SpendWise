import type { RateLimitState } from './types';

const STORAGE_KEY = 'sw_login_rate_limit';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ATTEMPT_COOLDOWN_MS = 1000; // Minimum 1 second between attempts

export class RateLimiter {
  private state: RateLimitState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): RateLimitState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RateLimitState;
        if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
          return { attempts: [], lockedUntil: null };
        }
        parsed.attempts = parsed.attempts.filter(
          a => Date.now() - a.timestamp < WINDOW_MS
        );
        return parsed;
      }
    } catch {
      // ignore
    }
    return { attempts: [], lockedUntil: null };
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // non-critical
    }
  }

  isLocked(): boolean {
    if (this.state.lockedUntil && Date.now() < this.state.lockedUntil) {
      return true;
    }
    if (this.state.lockedUntil && Date.now() >= this.state.lockedUntil) {
      this.state = { attempts: [], lockedUntil: null };
      this.persist();
    }
    return false;
  }

  getRemainingLockoutMs(): number {
    if (!this.state.lockedUntil) return 0;
    const remaining = this.state.lockedUntil - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  recordAttempt(): void {
    this.state.attempts.push({ timestamp: Date.now() });

    const recentAttempts = this.state.attempts.filter(
      a => Date.now() - a.timestamp < WINDOW_MS
    );
    this.state.attempts = recentAttempts;

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      this.state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    this.persist();
  }

  reset(): void {
    this.state = { attempts: [], lockedUntil: null };
    this.persist();
  }

  getAttemptCount(): number {
    return this.state.attempts.length;
  }

  canAttempt(): boolean {
    if (this.isLocked()) return false;

    const lastAttempt = this.state.attempts[this.state.attempts.length - 1];
    if (lastAttempt && Date.now() - lastAttempt.timestamp < ATTEMPT_COOLDOWN_MS) {
      return false;
    }

    return true;
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // non-critical
    }
  }
}

export const rateLimiter = new RateLimiter();
