import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

export function loadEnvFile(file: string): void {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

for (const file of [
  resolve(process.cwd(), '../.env'),
  resolve(process.cwd(), '.env'),
]) {
  loadEnvFile(file);
}

const optional = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined));

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_DOMAIN: optional,
  VAPID_PUBLIC_KEY: optional,
  VAPID_PRIVATE_KEY: optional,
  VAPID_SUBJECT: z.string().default('mailto:contact@example.com'),
  GOOGLE_CLIENT_ID: optional,
  GOOGLE_CLIENT_SECRET: optional,
  GOOGLE_CALLBACK_URL: optional,
  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,
  MAIL_FROM: z.string().default('LinguaGo <no-reply@linguago.test>'),
  SENTRY_DSN: optional,
  SWAGGER: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('\n  ');
  throw new Error(`Configuration invalide :\n  ${details}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
