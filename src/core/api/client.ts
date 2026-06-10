import { ZodType } from 'zod';
import { normalizeHttpError, ApiError, normalizeError, NormalizedError } from './errors';
import { recordApiTiming, logger } from '@/core/observability';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  defaultTimeout?: number;
  defaultRetries?: number;
}

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1_000;

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true;
  if (err instanceof ApiError && err.code === 'NETWORK_ERROR') return true;
  if (err instanceof ApiError && err.code === 'TIMEOUT') return true;
  return false;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(opts: ApiClientOptions = {}) {
    this.baseUrl = opts.baseUrl || '';
    this.defaultHeaders = opts.defaultHeaders || {};
    this.defaultTimeout = opts.defaultTimeout || DEFAULT_TIMEOUT;
    this.defaultRetries = opts.defaultRetries ?? DEFAULT_RETRIES;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.baseUrl}${path}`;
  }

  async request<T>(config: RequestConfig, responseSchema?: ZodType<T>): Promise<T> {
    if (!navigator.onLine) {
      throw new ApiError({ code: 'NETWORK_ERROR', message: 'No internet connection. Operation queued.', retryable: true });
    }

    const timeout = config.timeout ?? this.defaultTimeout;
    const maxRetries = config.retries ?? this.defaultRetries;
    const url = this.buildUrl(config.url);

    let lastError: NormalizedError = { code: 'UNKNOWN', message: 'Request failed.', retryable: false };

    const startTime = performance.now();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers: Record<string, string> = {
          ...this.defaultHeaders,
          ...config.headers,
        };

        const fetchInit: RequestInit = {
          method: config.method,
          headers,
          signal: controller.signal,
        };

        if (config.body !== undefined && config.method !== 'GET') {
          fetchInit.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, fetchInit);
        clearTimeout(timeoutId);

        const durationMs = Math.round(performance.now() - startTime);
        recordApiTiming(config.url, durationMs);

        if (!response.ok) {
          const bodyText = await response.text().catch(() => '');
          const normalized = normalizeHttpError(response.status, bodyText);
          lastError = normalized;

          logger.system.warn(`API ${config.method} ${config.url} failed`, { status: response.status, durationMs });

          if (isRetryable(response.status) && attempt < maxRetries) {
            await this.delay(config.retryDelay ?? DEFAULT_RETRY_DELAY * Math.pow(2, attempt));
            continue;
          }

          throw new ApiError(normalized);
        }

        const body = await response.json().catch(() => null);

        if (responseSchema) {
          const parsed = responseSchema.safeParse(body);
          if (!parsed.success) {
            throw new ApiError({
              code: 'VALIDATION_ERROR',
              message: 'Response validation failed.',
              details: parsed.error.issues.map(e => ({ path: e.path.map(p => String(p)).join('.'), message: e.message })),
              retryable: false,
            });
          }
          return parsed.data;
        }

        return body as T;
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.retryable && attempt < maxRetries) {
            lastError = { code: err.code, message: err.message, status: err.status, details: err.details, retryable: true };
            await this.delay(config.retryDelay ?? DEFAULT_RETRY_DELAY * Math.pow(2, attempt));
            continue;
          }
          throw err;
        }

        if (isNetworkError(err) && attempt < maxRetries) {
          lastError = normalizeError(err);
          await this.delay(config.retryDelay ?? DEFAULT_RETRY_DELAY * Math.pow(2, attempt));
          continue;
        }

        const normalized = normalizeError(err);
        throw new ApiError(normalized);
      }
    }

    throw new ApiError(lastError);
  }

  async get<T>(url: string, config?: Partial<RequestConfig>, schema?: ZodType<T>): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config }, schema);
  }

  async post<TInput, TOutput>(url: string, body?: TInput, config?: Partial<RequestConfig>, schema?: ZodType<TOutput>): Promise<TOutput> {
    return this.request<TOutput>({ method: 'POST', url, body: body as Record<string, unknown>, ...config }, schema);
  }

  async put<TInput, TOutput>(url: string, body?: TInput, config?: Partial<RequestConfig>, schema?: ZodType<TOutput>): Promise<TOutput> {
    return this.request<TOutput>({ method: 'PUT', url, body: body as Record<string, unknown>, ...config }, schema);
  }

  async patch<TInput, TOutput>(url: string, body?: TInput, config?: Partial<RequestConfig>, schema?: ZodType<TOutput>): Promise<TOutput> {
    return this.request<TOutput>({ method: 'PATCH', url, body: body as Record<string, unknown>, ...config }, schema);
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>, schema?: ZodType<T>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config }, schema);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createClient(opts?: ApiClientOptions): ApiClient {
  return new ApiClient(opts);
}
