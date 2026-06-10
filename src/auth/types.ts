export interface MfaState {
  enrolled: boolean;
  verifiedForSession: boolean;
  factorId: string | null;
  enrolledAt: string | null;
}

export interface RecoveryCode {
  code: string;
  used: boolean;
}

export interface StoredRecoveryCode {
  hash: string;
  used: boolean;
}

export interface DeviceInfo {
  id: string;
  label: string;
  trusted: boolean;
  lastUsed: string;
  createdAt: string;
  userAgent: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  deviceId: string;
  mfaVerified: boolean;
}

export interface FailedAttempt {
  timestamp: number;
  ip?: string;
}

export interface RateLimitState {
  attempts: FailedAttempt[];
  lockedUntil: number | null;
}

export interface MfaSetupData {
  secret: string;
  otpauthUrl: string;
  factorId: string | null;
}

export interface TokenRotationResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
