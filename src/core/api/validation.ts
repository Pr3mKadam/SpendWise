import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email()
  .max(254)
  .transform(v => v.toLowerCase().trim());

export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.').max(128);

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(128),
});

export const mfaCodeSchema = z.string().regex(/^\d{6}$/, 'MFA code must be exactly 6 digits.');

export const recoveryCodeSchema = z.string().min(4).max(20);

// ─── MFA ──────────────────────────────────────────────────────────────────────

export const mfaEnrollSchema = z.object({
  friendly_name: z.string().min(1).max(64),
  factor_type: z.literal('totp'),
  issuer: z.string().min(1).max(64),
});

export const mfaChallengeSchema = z.object({
  code: mfaCodeSchema,
});

// ─── Transactions ─────────────────────────────────────────────────────────────

const transactionTypeSchema = z.enum(['credit', 'debit']);
const categorySchema = z.string().min(1).max(64);

export const transactionSchema = z.object({
  id: z.string().min(1).max(128),
  user_id: z.string().min(1).max(128),
  date: z.string().min(1),
  amount: z.number().finite(),
  type: transactionTypeSchema,
  category: categorySchema,
  merchant: z.string().min(1).max(255),
  description: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  ai_parsed: z.boolean().optional(),
  deleted_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const transactionBatchSchema = z.array(transactionSchema).max(500);

// ─── Gamification ─────────────────────────────────────────────────────────────

export const gamificationSchema = z.object({
  user_id: z.string().min(1).max(128),
  total_xp: z.number().int().min(0),
  level: z.number().int().min(1),
  streak: z.number().int().min(0),
  last_active: z.string().min(1),
  deleted_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// ─── Gemini / AI ──────────────────────────────────────────────────────────────

const geminiContentPartSchema = z.object({
  text: z.string().min(1).max(50000),
});

const geminiContentSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.array(geminiContentPartSchema).min(1).max(100),
});

export const geminiRequestSchema = z.object({
  contents: z.array(geminiContentSchema).min(1).max(100),
  systemInstruction: z.string().max(2000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().min(1).max(8192).optional(),
});

export const geminiResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(z.object({ text: z.string() })),
      }),
      finishReason: z.string().optional(),
    })
  ),
  usageMetadata: z
    .object({
      promptTokenCount: z.number().int(),
      candidatesTokenCount: z.number().int(),
      totalTokenCount: z.number().int(),
    })
    .optional(),
});

// ─── Setu AA ──────────────────────────────────────────────────────────────────

export const setuConsentSchema = z.object({
  action: z.literal('create-consent'),
  environment: z.enum(['sandbox', 'production']),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number.'),
});

export const setuConsentCheckSchema = z.object({
  action: z.literal('check-consent'),
  consentId: z.string().min(1).max(128),
});

export const setuFetchStatementsSchema = z.object({
  action: z.literal('fetch-statements'),
  consentId: z.string().min(1).max(128),
});

export const setuConsentResponseSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED']),
});

// ─── Razorpay ─────────────────────────────────────────────────────────────────

export const razorpaySyncSchema = z.object({
  keyId: z.string().regex(/^rzp_(test_|live_)?[A-Za-z0-9]+$/, 'Invalid Razorpay key ID.'),
});

export const razorpayPaymentOptionsSchema = z.object({
  keyId: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  prefillName: z.string().max(128).optional(),
  prefillEmail: z.string().email().optional(),
  prefillContact: z.string().max(20).optional(),
});

// ─── Send Invite ──────────────────────────────────────────────────────────────

export const sendInviteSchema = z.object({
  to: z.string().email(),
  toName: z.string().min(1).max(128),
  groupName: z.string().min(1).max(128),
  groupId: z.string().min(1).max(128),
  fromName: z.string().min(1).max(128),
  joinUrl: z.string().url(),
});

// ─── Yahoo Finance ────────────────────────────────────────────────────────────

export const marketQuoteSchema = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(128),
  price: z.number().finite(),
  change: z.number().finite(),
  changePct: z.number().finite(),
  lastUpdated: z.string(),
});

// ─── Supabase Auth Responses ──────────────────────────────────────────────────

export const supabaseAuthResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string(),
  expires_in: z.number().positive(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
  }),
});

export const supabaseTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string(),
  expires_in: z.number().positive(),
});

// ─── MFA Factor Response ──────────────────────────────────────────────────────

export const mfaFactorSchema = z.object({
  id: z.string(),
  friendly_name: z.string(),
  factor_type: z.literal('totp'),
  status: z.enum(['unverified', 'verified']),
  created_at: z.string(),
  updated_at: z.string(),
});

export const mfaFactorListSchema = z.array(mfaFactorSchema);

export const mfaChallengeResponseSchema = z.object({
  id: z.string(),
  factor_id: z.string(),
  status: z.enum(['pending', 'verified']),
  expires_at: z.string(),
});

export const mfaEnrollResponseSchema = z.object({
  id: z.string(),
  type: z.literal('totp'),
  totp: z
    .object({
      qr_code: z.string(),
      secret: z.string(),
      uri: z.string(),
    })
    .optional(),
});
