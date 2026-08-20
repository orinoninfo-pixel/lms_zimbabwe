# Dzidza Hub LMS

Dzidza Hub is a full-stack learning platform for Zimbabwean students, instructors, internal content managers, and administrators. It combines a course marketplace, Zimbabwe Learning Hub subject subscriptions, secure Paynow checkout, certificates, instructor operations, and a public Free Learning tutorial area.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- PostgreSQL with Prisma 7 and the `pg` adapter
- Database-backed, hashed-token sessions and server-side RBAC
- Paynow payments verified server-to-server
- S3-compatible object storage for course and tutorial images
- Node test runner and Playwright

## Local setup

1. Install Node.js 20 or newer and PostgreSQL.
2. Copy `.env.example` to `.env.local` and supply local values.
3. Install dependencies with `npm install`.
4. Apply migrations with `npm run db:migrate:deploy`.
5. Seed development content with `npm run db:seed`.
6. Start the app with `npm run dev`.

Never point test commands at development or production data. `npm run test:db:prepare` refuses to reset a database unless its database name or schema contains `test`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e:safe
npm run build
npm run db:generate
npx prisma validate
```

Install the browser once with `npx playwright install chromium`. E2E payment checks use the guarded Paynow mock only when `E2E_TEST_MODE=1`, `PAYNOW_TEST_MODE=mock`, and the database URL is unmistakably a test database. They never contact Paynow.

## Production configuration

Set every required value from `.env.example`. Production startup validates the database URL, HTTPS application URL, and Paynow credentials. Configure an S3-compatible bucket; local disk is intentionally not used for durable uploads. PostgreSQL TLS certificate verification is enabled in production and can use `DATABASE_CA_CERT` for a private CA.

Deploy schema changes with `npm run db:migrate:deploy` before starting the new application version. Do not run `prisma migrate reset` outside the isolated test workflow.

## Free Learning

Public tutorials live at `/learn`, with Python as the seeded reference curriculum. Anonymous readers can navigate lessons and exercises. Students can save progress and bookmarks. Admins and internal content managers maintain tutorial metadata and structured sections, lessons, examples, exercises, and quizzes from their consoles.

See [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) and [QA_CHECKLIST.md](./QA_CHECKLIST.md) before release.
