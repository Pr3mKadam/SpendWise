import { logger } from './logger';
import { getCurrentHub } from './sentry';
import { writeAuditLog } from '@/db/db';

// ─── Domain Event Types ───────────────────────────────────────────────────────

export type EventDomain = 'auth' | 'transaction' | 'sync' | 'ai' | 'payment' | 'admin';

export type AuthEvent =
  | 'AUTH_LOGIN'
  | 'AUTH_SIGNUP'
  | 'AUTH_LOGOUT'
  | 'AUTH_MFA_ENROLL'
  | 'AUTH_MFA_VERIFY'
  | 'AUTH_MFA_RECOVERY'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_RATE_LIMITED';

export type TransactionEvent =
  | 'TX_CREATED'
  | 'TX_UPDATED'
  | 'TX_DELETED'
  | 'TX_BULK_DELETED'
  | 'TX_CATEGORY_REASSIGN';

export type SyncEvent =
  | 'SYNC_STARTED'
  | 'SYNC_PUSH'
  | 'SYNC_PULL'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'SYNC_CONFLICT'
  | 'SYNC_PURGE';

export type AiEvent =
  | 'AI_PARSE'
  | 'AI_CHAT'
  | 'AI_OCR'
  | 'AI_RECOMMENDATION'
  | 'AI_FALLBACK'
  | 'AI_ERROR';

export type PaymentEvent =
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'PAYMENT_VERIFIED'
  | 'RAZORPAY_SYNC';

export type AdminEvent =
  | 'ADMIN_BACKUP_EXPORT'
  | 'ADMIN_BACKUP_IMPORT'
  | 'ADMIN_BACKUP_AUTO'
  | 'ADMIN_DATA_PURGE'
  | 'ADMIN_CONFIG_CHANGE';

export type ObservabilityEvent =
  | AuthEvent
  | TransactionEvent
  | SyncEvent
  | AiEvent
  | PaymentEvent
  | AdminEvent;

// ─── Event Payloads ───────────────────────────────────────────────────────────

export interface TrackEventPayload {
  domain: EventDomain;
  name: ObservabilityEvent;
  userId?: string;
  metadata?: Record<string, unknown>;
  durationMs?: number;
  error?: string;
}

// ─── Track Function ────────────────────────────────────────────────────────────

const loggerMap: Record<EventDomain, keyof typeof logger> = {
  auth: 'auth',
  transaction: 'tx',
  sync: 'sync',
  ai: 'ai',
  payment: 'payments',
  admin: 'admin',
};

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  const log = logger[loggerMap[payload.domain] || 'system'];

  if (payload.error) {
    log.error(`${payload.name}: ${payload.error}`, { metadata: payload.metadata, durationMs: payload.durationMs });
  } else {
    log.info(`${payload.name}`, { metadata: payload.metadata, durationMs: payload.durationMs });
  }

  const hub = getCurrentHub();
  if (hub) {
    hub.addBreadcrumb({
      category: payload.domain,
      message: payload.name,
      level: payload.error ? 'error' : 'info',
      data: {
        ...payload.metadata,
        userId: payload.userId,
        durationMs: payload.durationMs,
        error: payload.error,
      },
      timestamp: Date.now() / 1000,
    });
  }

  await writeAuditLog(
    payload.domain,
    payload.error ? 'DELETE' : 'INSERT',
    payload.name,
    payload.error || undefined,
    JSON.stringify({ metadata: payload.metadata, userId: payload.userId, durationMs: payload.durationMs })
  );
}

// ─── Convenience Trackers ──────────────────────────────────────────────────────

export function trackAuthEvent(
  name: AuthEvent,
  userId?: string,
  metadata?: Record<string, unknown>,
  error?: string
): void {
  trackEvent({ domain: 'auth', name, userId, metadata, error });
}

export function trackTransactionEvent(
  name: TransactionEvent,
  userId?: string,
  metadata?: Record<string, unknown>,
  error?: string,
  durationMs?: number
): void {
  trackEvent({ domain: 'transaction', name, userId, metadata, error, durationMs });
}

export function trackSyncEvent(
  name: SyncEvent,
  userId?: string,
  metadata?: Record<string, unknown>,
  error?: string,
  durationMs?: number
): void {
  trackEvent({ domain: 'sync', name, userId, metadata, error, durationMs });
}

export function trackAiEvent(
  name: AiEvent,
  userId?: string,
  metadata?: Record<string, unknown>,
  error?: string,
  durationMs?: number
): void {
  trackEvent({ domain: 'ai', name, userId, metadata, error, durationMs });
}

export function trackPaymentEvent(
  name: PaymentEvent,
  userId?: string,
  metadata?: Record<string, unknown>,
  error?: string,
  durationMs?: number
): void {
  trackEvent({ domain: 'payment', name, userId, metadata, error, durationMs });
}

export function trackAdminEvent(
  name: AdminEvent,
  metadata?: Record<string, unknown>,
  error?: string
): void {
  trackEvent({ domain: 'admin', name, metadata, error });
}
