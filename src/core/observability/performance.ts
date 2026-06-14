import { logger } from './logger';
import { getCurrentHub } from './sentry';
import { captureMessage } from './sentry';

// ─── Web Vitals ────────────────────────────────────────────────────────────────

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const VITAL_THRESHOLDS: Record<string, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function rateVital(name: string, value: number): WebVitalMetric['rating'] {
  const thresholds = VITAL_THRESHOLDS[name];
  if (!thresholds) return 'good';
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export function observeWebVitals(): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  const cleanupFns: (() => void)[] = [];

  try {
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const e = entry as unknown as { hadRecentInput: boolean; startTime: number; value: number };
        if (!e.hadRecentInput) {
          reportVital('CLS', e.value || e.startTime);
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
    cleanupFns.push(() => clsObserver.disconnect());
  } catch { /* silently ignore — non-critical */ }

  try {
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        reportVital('LCP', entries[entries.length - 1].startTime);
      }
    });
    lcpObserver.observe({
      type: 'largest-contentful-paint',
      buffered: true,
    } as PerformanceObserverInit);
    cleanupFns.push(() => lcpObserver.disconnect());
  } catch { /* silently ignore — non-critical */ }

  try {
    const fidObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        reportVital('FID', fidEntry.processingStart - fidEntry.startTime);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true } as PerformanceObserverInit);
    cleanupFns.push(() => fidObserver.disconnect());
  } catch { /* silently ignore — non-critical */ }

  try {
    const paintObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportVital('FCP', entry.startTime);
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true } as PerformanceObserverInit);
    cleanupFns.push(() => paintObserver.disconnect());
  } catch { /* silently ignore — non-critical */ }

  try {
    const navObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        reportVital('TTFB', navEntry.responseStart - navEntry.requestStart);
      }
    });
    navObserver.observe({ type: 'navigation', buffered: true } as PerformanceObserverInit);
    cleanupFns.push(() => navObserver.disconnect());
  } catch { /* silently ignore — non-critical */ }

  if ('PerformanceObserver' in window) {
    try {
      const inpObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const inpEntry = entry as PerformanceEventTiming & { interactionId: number };
          if (inpEntry.interactionId > 0) {
            reportVital('INP', inpEntry.duration);
          }
        }
      });
      inpObserver.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 0,
      } as PerformanceObserverInit);
      cleanupFns.push(() => inpObserver.disconnect());
    } catch { /* silently ignore — non-critical */ }
  }

  return () => cleanupFns.forEach(fn => fn());
}

function reportVital(name: string, value: number): void {
  const rating = rateVital(name, value);
  const rounded = Math.round(value * 100) / 100;

  logger.perf.info(`Web Vital: ${name}`, { value: rounded, rating });

  const hub = getCurrentHub();
  if (hub) {
    hub.setMeasurement?.(name, value, 'milliseconds');
  }

  if (rating === 'poor') {
    captureMessage(`Poor Web Vital: ${name}`, 'warning', {
      value: rounded,
      threshold: VITAL_THRESHOLDS[name]?.poor,
    });
  }
}

// ─── API Timing ────────────────────────────────────────────────────────────────

const apiTimings: Map<string, number[]> = new Map();

export function recordApiTiming(endpoint: string, durationMs: number): void {
  const timings = apiTimings.get(endpoint) || [];
  timings.push(durationMs);
  if (timings.length > 100) timings.shift();
  apiTimings.set(endpoint, timings);

  if (durationMs > 5000) {
    captureMessage(`Slow API: ${endpoint}`, 'warning', { durationMs });
  }
}

export function getApiStats(endpoint: string): { avg: number; p95: number; count: number } | null {
  const timings = apiTimings.get(endpoint);
  if (!timings || timings.length === 0) return null;

  const sorted = [...timings].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  return { avg: Math.round(avg), p95: Math.round(p95), count: sorted.length };
}

export function getAllApiStats(): Record<string, { avg: number; p95: number; count: number }> {
  const stats: Record<string, { avg: number; p95: number; count: number }> = {};
  for (const [endpoint] of apiTimings) {
    const s = getApiStats(endpoint);
    if (s) stats[endpoint] = s;
  }
  return stats;
}

// ─── Route Transition Timing ───────────────────────────────────────────────────

let routeTransitionStart = 0;

export function markRouteTransitionStart(): void {
  routeTransitionStart = performance.now();
}

export function markRouteTransitionEnd(routeName: string): void {
  if (routeTransitionStart === 0) return;
  const duration = performance.now() - routeTransitionStart;
  logger.perf.info(`Route transition: ${routeName}`, { durationMs: Math.round(duration) });
  routeTransitionStart = 0;

  if (duration > 1000) {
    captureMessage(`Slow route: ${routeName}`, 'warning', { durationMs: Math.round(duration) });
  }
}

// ─── Memory Usage ──────────────────────────────────────────────────────────────

export function reportMemoryUsage(): void {
  if ('memory' in performance) {
    const mem = (
      performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
    ).memory;
    const usedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(mem.jsHeapSizeLimit / 1024 / 1024);
    logger.perf.debug('Memory usage', {
      usedMB,
      limitMB,
      pct: Math.round((usedMB / limitMB) * 100),
    });
  }
}
