import { defineConfig, env } from 'prisma/config';

if (process.env.VERCEL !== '1') {
  require('dotenv/config');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
});