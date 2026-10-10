import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

for (const file of ['../.env', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
