import * as Sentry from '@sentry/react';
import { SENTRY_DSN, APP_VERSION } from '@/config/env';

const DSN = SENTRY_DSN;

let initialized = false;

export function initSentry(): boolean {
  if (initialized) return true;
  if (!DSN) return false;

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE || 'development',
    release: `spendwise@${APP_VERSION}`,
    tracesSampleRate: import.meta.env.PROD ? 0.25 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.zodErrorsIntegration(),
    ],
    beforeSend(event) {
      if (!import.meta.env.PROD) {
        // eslint-disable-next-line no-console
        console.debug('[Sentry] Event:', event.exception?.values?.[0]?.value ?? event.message);
      }
      return event;
    },
  });

  initialized = true;
  return true;
}

export function getCurrentHub(): typeof Sentry | null {
  return initialized ? Sentry : null;
}

export function setSentryUser(user: { id: string; email?: string } | null): void {
  if (!initialized) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.withScope(scope => {
    if (context) scope.setExtras(context);
    Sentry.captureMessage(message, level);
  });
}

export function setSentryTag(name: string, value: string): void {
  if (!initialized) return;
  Sentry.setTag(name, value);
}

export { Sentry };
