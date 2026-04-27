import { config as loadDotenv } from 'dotenv'

// Load .env first (committed defaults), then .env.local (gitignored secrets)
// which overrides matching keys. This mirrors Vite/Next-style precedence and
// keeps real secrets out of the repo.
loadDotenv()
loadDotenv({ path: '.env.local', override: true })

// ─── Required env vars ────────────────────────────────────────────────────
//
// Server refuses to start if any of these are missing. We collect ALL
// missing names first and throw once, so the user fixes their .env in a
// single pass instead of restart-by-restart.

const required = {
  JWT_USER_ACCESS_KEY: process.env.JWT_USER_ACCESS_KEY,
  JWT_USER_ACTIVATION_KEY: process.env.JWT_USER_ACTIVATION_KEY,
  JWT_RESET_PASSWORD_KEY: process.env.JWT_RESET_PASSWORD_KEY,
  JWT_QUIZ_SECRET_KEY: process.env.JWT_QUIZ_SECRET_KEY,
  MONGODB_URL: process.env.MONGODB_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
} as const

const missing = Object.entries(required)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      `See API_CONTRACT.md §9.`
  )
}

// ─── Reject placeholder secrets ───────────────────────────────────────────
//
// `.env` ships with literal `dev-*-please-replace-with-...` placeholder
// values for the JWT keys so a fresh clone fails loudly instead of running
// with a known-public secret. Real values must live in `.env.local`
// (gitignored), which overrides `.env` per the loader above.
//
// Detection is a literal substring match — `openssl rand -hex 32` returns
// only [0-9a-f], so a real secret can't accidentally hit `please-replace-with`.

const PLACEHOLDER_SUBSTRING = 'please-replace-with'
const placeholders = (
  ['JWT_USER_ACCESS_KEY', 'JWT_USER_ACTIVATION_KEY', 'JWT_RESET_PASSWORD_KEY', 'JWT_QUIZ_SECRET_KEY'] as const
).filter((k) => required[k]?.includes(PLACEHOLDER_SUBSTRING))

if (placeholders.length) {
  throw new Error(
    `Refusing to boot with placeholder secrets: ${placeholders.join(', ')}. ` +
      `Generate real values with \`openssl rand -hex 32\` and put them in ` +
      `Backend-Digital-Tests/.env.local (gitignored), one line per key.`
  )
}

// ─── Optional env vars (sensible defaults) ────────────────────────────────

const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'
const bcryptCost = Number(process.env.BCRYPT_COST) || 12

export const dev = {
  app: {
    nodeEnv,
    isProd,
    port: Number(process.env.PORT) || 8080,

    // Auth + token signing — every key is its own secret per contract §3.1.
    jwtUserAccessKey: required.JWT_USER_ACCESS_KEY as string,
    jwtUserActivationKey: required.JWT_USER_ACTIVATION_KEY as string,
    jwtresetPassword: required.JWT_RESET_PASSWORD_KEY as string,
    jwtQuizSecretKey: required.JWT_QUIZ_SECRET_KEY as string,

    // Password hashing.
    bcryptCost,

    // Email — Mailtrap creds are wired in Step 8. Until then these are
    // unused; left as optional so Step 1 doesn't refuse to boot for users
    // who haven't put Mailtrap creds in .env yet.
    mailtrapUser: process.env.MAILTRAP_USER || '',
    mailtrapPass: process.env.MAILTRAP_PASS || '',
    mailFrom: process.env.MAIL_FROM || 'noreply@digital-tests.local',

    // Legacy SMTP fields — still consumed by sendEmail.ts until Step 8.
    smtpUsername: process.env.SMTP_USERNAME || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',

    frontendUrl: required.FRONTEND_URL as string,

    // CORS allowlist — comma-separated in .env, parsed once here.
    allowedOrigins: (required.ALLOWED_ORIGINS as string)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },
  db: {
    url: required.MONGODB_URL as string,
  },
}
