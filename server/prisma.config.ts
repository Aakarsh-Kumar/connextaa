import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  experimental: {
    externalTables: true,
  },
  enums: {
    external: ['public.crdb_internal_region'],
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
} as any);
