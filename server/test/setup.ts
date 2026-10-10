import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Client } from 'pg';
import { loadEnvFile } from '../src/config/env';

async function recreateDatabase(url: string) {
  const target = new URL(url);
  const name = target.pathname.replace(/^\//, '');
  const maintenance = new URL(url);
  maintenance.pathname = '/postgres';
  const client = new Client({ connectionString: maintenance.toString() });
  await client.connect();
  try {
    await client.query(
      'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
      [name],
    );
    await client.query(`DROP DATABASE IF EXISTS "${name}"`);
    await client.query(`CREATE DATABASE "${name}"`);
  } finally {
    await client.end();
  }
}

export default async function globalSetup() {
  const root = resolve(__dirname, '..');
  for (const file of [resolve(root, '../.env'), resolve(root, '.env')]) {
    loadEnvFile(file);
  }
  const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL ?? '';
  if (!/test/i.test(url)) {
    throw new Error(
      'Les tests de bout en bout exigent une base dédiée : DATABASE_URL_TEST doit contenir "test".',
    );
  }
  process.env.DATABASE_URL = url;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET ??=
    'secret-de-test-suffisamment-long-pour-passer-la-validation';

  await recreateDatabase(url);
  const env = { ...process.env, DATABASE_URL: url };
  execSync('npx prisma migrate deploy', { cwd: root, env, stdio: 'inherit' });
  execSync('npx tsx prisma/seed.ts --reset', {
    cwd: root,
    env,
    stdio: 'inherit',
  });
}
