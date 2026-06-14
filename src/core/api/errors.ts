import { ZodError } from 'zod';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'MFA_REQUIRED'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN';

export interface NormalizedError {
  code: ErrorCode;
  message: string;
  status?: number;
  details?: unknown;
  retryable: boolean;
}

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly status?: number;
  public readonly details?: unknown;
  public readonly retryable: boolean;

  constructor(opts: NormalizedError) {
    super(opts.message);
    this.name = 'ApiError';
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
    this.retryable = opts.retryable;
  }
}

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    return {
      code: err.code,
      message: err.message,
      status: err.status,
      details: err.details,
      retryable: err.retryable,
    };
  }

  if (err instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed.',
      details: err.issues.map(e => ({
        path: e.path.map(p => String(p)).join('.'),
        message: e.message,
      })),
      retryable: false,
    };
  }

  if (err instanceof DOMException && err.name === 'TimeoutError') {
    return { code: 'TIMEOUT', message: 'Request timed out.', retryable: true };
  }

  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network request failed. Check your connection.',
      retryable: true,
    };
  }

  if (err instanceof TypeError && err.message.includes('fetch')) {
    return { code: 'NETWORK_ERROR', message: 'Network request failed.', retryable: true };
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('rate limit') || msg.includes('429') || msg.includes('too many')) {
      return { code: 'RATE_LIMITED', message: err.message, retryable: true };
    }
    if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('token')) {
      return { code: 'AUTH_ERROR', message: err.message, retryable: false };
    }
    if (msg.includes('not found') || msg.includes('404')) {
      return { code: 'NOT_FOUND', message: err.message, retryable: false };
    }
    if (msg.includes('mfa') || msg.includes('factor')) {
      return { code: 'MFA_REQUIRED', message: err.message, retryable: false };
    }
    return { code: 'UNKNOWN', message: err.message, retryable: false };
  }

  return { code: 'UNKNOWN', message: 'An unexpected error occurred.', retryable: false };
}

export function normalizeHttpError(status: number, body: string): NormalizedError {
  const codeMap: Record<number, ErrorCode> = {
    400: 'VALIDATION_ERROR',
    401: 'AUTH_ERROR',
    403: 'AUTH_ERROR',
    404: 'NOT_FOUND',
    409: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'SERVER_ERROR',
    502: 'SERVER_ERROR',
    503: 'SERVER_ERROR',
  };

  const { message, details } = parseErrorBody(body);
  const code = codeMap[status] || 'UNKNOWN';

  return {
    code,
    message,
    status,
    details,
    retryable: status >= 500 || status === 429,
  };
}

function parseErrorBody(body: string): { message: string; details?: unknown } {
  try {
    const parsed = JSON.parse(body);
    const msg =
      parsed.error?.description ||
      parsed.error?.message ||
      parsed.msg ||
      parsed.error_description ||
      parsed.message ||
      body;
    return { message: msg, details: parsed };
  } catch {
    // silently ignore — non-critical
    if (body.length > 200) {
      return { message: body.substring(0, 200) + '...' };
    }
    return { message: body || 'Unknown error' };
  }
}

export function throwNormalized(err: unknown): never {
  const normalized = normalizeError(err);
  throw new ApiError(normalized);
}
