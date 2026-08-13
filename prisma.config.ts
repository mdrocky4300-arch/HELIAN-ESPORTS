import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || 'file:./dev.db',
    directUrl: process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL,
  },
});
