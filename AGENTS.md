<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:prisma-rules -->
# Prisma 7 — config, not schema URLs

The `url` and `directUrl` go in `prisma.config.ts`, NOT in `schema.prisma`.
The datasource block in `schema.prisma` only has `provider = "postgresql"`.

PrismaClient needs an `adapter` (from `@prisma/adapter-pg`) for direct DB connections.
CLI requires `dotenv` import in `prisma.config.ts` (env not auto-loaded).
Use `prisma db push` to sync schema; `prisma migrate dev` for versioned migrations.
<!-- END:prisma-rules -->
