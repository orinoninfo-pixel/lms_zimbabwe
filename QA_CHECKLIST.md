# Manual QA Checklist — dzidzahub.co.zw

Run this before any release to production. Pair with the automated suite in
`tests/e2e/**` (see `README` section at the bottom for setup) — this checklist
covers things Playwright doesn't (visual polish, real payment gateway, email
delivery) plus a few things worth eyeballing even though they're automated.

> **Known findings from building this suite** — read first, these affect what
> "correct" looks like below:
> 1. **All role-gate redirects go to `/` (home), not `/login` and not the
>    visitor's own dashboard.** This applies to admin, internal-instructor, and
>    student areas. If your mental model says "should redirect to /login",
>    that's not what's implemented — decide if that's acceptable UX or a fix
>    to schedule, don't assume it's a bug in this checklist.
> 2. **`/instructor/**` has no server-side route guard**, unlike the other
>    three roles. Protection is a client-side check (`fetch("/api/auth/me")`
>    then `router.replace("/")`) that runs after the page's own JS mounts.
>    A fast connection or a paused debugger can show a flash of the
>    authenticated-looking page shell before the redirect fires. Low risk today
>    (no sensitive data renders before the check), but worth hardening with a
>    real layout-level guard like the other three roles have.
> 3. **The course-creation wizard's Category/Level/Language selects on step 1
>    do nothing.** They're required to unlock "Submit for Review" client-side,
>    but are never sent to the API — `course.categoryId` stays `null` until an
>    admin sets one manually on the review page. Every course you approve needs
>    its category set at approval time, or it'll never satisfy the admin
>    checklist and will look uncategorized on the public site.
> 4. **The public `/courses` catalog has no in-page filter/search** — category
>    filtering only exists via `/categories` → click a category tile →
>    `/categories/[slug]`. If you're expecting a filter dropdown on the catalog
>    page itself, it isn't there.
> 5. **Paynow is live**, not a sandbox/mock (`.env` has real
>    `PAYNOW_INTEGRATION_ID`/`KEY`). Never QA a real purchase against a paid
>    course with a real card unless you intend to actually pay — use a $0
>    course, or stop at the "redirected to Paynow" step.

---

## 1. Authentication & RBAC

- [ ] Each of the 4 roles (student, instructor, internal_instructor/content
      manager, admin) can log in with correct credentials and lands on the
      right area (`/dashboard`, `/instructor`, `/internal-instructor`, `/admin`
      respectively).
- [ ] Wrong password shows an inline error and does **not** navigate away from
      `/login`.
- [ ] A user flagged `mustChangePassword` is redirected to `/reset-password`
      with a token, not silently logged in.
- [ ] Logout actually clears the session — re-visiting a gated route
      afterward bounces you again, it doesn't silently let you back in.
- [ ] Student visiting `/admin`, `/admin/transactions`, `/internal-instructor`
      → redirected to `/` (not shown an error page, not shown partial admin
      UI).
- [ ] Content manager visiting `/admin/**` → redirected to `/`.
- [ ] External instructor visiting `/admin/**` or `/internal-instructor` →
      redirected to `/`.
- [ ] Admin visiting `/dashboard` (student area) → redirected to `/`.
- [ ] Anonymous visit to any of the above gated routes → redirected to `/`.
- [ ] Anonymous or wrong-role visit to `/instructor/**` → watch closely for a
      flash of instructor UI before the client-side redirect fires (see
      finding #2 above); confirm no sensitive data is visible in that window.
- [ ] Session cookies (`lms_user_id`, `lms_role`) are `httpOnly` and not
      readable from `document.cookie` in devtools console.

## 2. Course creation & approval lifecycle

- [ ] Content manager: create a course, fill title + description (>50 chars)
      + price, add at least 1 section with 3+ lessons — confirm "Submit for
      Review" stays disabled until all of those are filled, including
      Category/Level (even though they're discarded — finding #3).
- [ ] "Save Draft" persists and reloading `/internal-instructor/courses` still
      shows it as Draft.
- [ ] After "Submit for Review", course shows status "Pending" in the
      creator's own course list and is **not** visible on `/courses` or
      `/categories/**` yet.
- [ ] Admin: pending course appears in `/admin/courses` filtered to "Pending"
      status, and in the review page's Previous/Next pending-queue nav.
- [ ] Admin sets a Category on the review page — "Save and Approve" is
      disabled before this and enabled after (plus title/description/price
      present).
- [ ] After approval, course is immediately visible on `/courses`, on its
      `/categories/[slug]` page, and directly at `/course/[id]` for a logged
      out visitor.
- [ ] Reject flow: reject a course with a moderation note — creator sees the
      note and can resubmit; resubmitting clears the old note and goes back to
      Pending.
- [ ] Suspend flow: suspend a previously-approved course with live
      enrollments — confirm already-enrolled students still retain access to
      `/learn/[id]` (suspension should affect new visibility/purchases, verify
      it doesn't lock out paying students already inside).
- [ ] Repeat the same lifecycle for an **external instructor**-created course
      via `/instructor/courses/new` — it shares the same admin review queue,
      confirm it's not accidentally filtered out anywhere.

## 3. Student enrollment & payment

- [ ] Browse `/courses` — every listed course is `status: approved` (spot
      check a couple against `/admin/courses`).
- [ ] `/categories` tiles link to `/categories/[slug]` and show only that
      category's approved courses.
- [ ] Free ($0) course: "Enroll for Free" completes instantly, no redirect off
      -site, lands on `/learn/[id]`, and the course appears on `/dashboard`
      under Enrolled Courses immediately.
- [ ] Paid course: "Pay with Paynow" redirects to the real Paynow checkout
      page — **stop here in QA**, don't complete a real card payment unless
      intentionally verifying the full money-movement path with a disposable
      test transaction.
- [ ] Paynow return flow: after a completed (or manually simulated) payment,
      `/payment-status` reflects success and the course unlocks on the
      dashboard without needing a manual refresh/re-login.
- [ ] Re-clicking enroll on an already-enrolled course shows "Open Course"
      (a link), not the enroll button again, and doesn't create a duplicate
      enrollment/transaction row.
- [ ] Un-authenticated enroll click redirects to `/login?next=/course/[id]`
      and, after logging in, actually returns you to that course page (not
      dropped on `/dashboard`).
- [ ] Favorite/Wishlist toggle persists across a page reload.

## 4. Database / connection resilience

- [ ] Run `npm run db:resilience-check` (optionally against the deployed
      Vercel URL: `BASE_URL=https://dzidzahub.co.zw npm run db:resilience-check`)
      and confirm it reports **PASS** with zero pool-exhaustion signatures.
- [ ] Watch Neon's dashboard (Monitoring → Connections) during a real traffic
      spike (or while the script above runs) — active connections should stay
      well under the plan's limit, not sawtooth against the ceiling.
- [ ] Check Vercel function logs during the same window for `P2024` (Prisma
      pool timeout) or raw Postgres "too many clients" errors.
- [ ] Confirm `lib/prisma.ts`'s pool `max` (currently 5 per serverless
      instance) times your expected concurrent function instances stays under
      Neon's compute-size connection ceiling — if you scale Vercel's max
      instances up, revisit this number.

## 5. Cross-cutting / general

- [ ] Test on both desktop width and a real mobile viewport — sidebars and
      wizards in particular are desktop-first (`hidden lg:block` sidebars).
- [ ] Confirm no console errors on any of the 4 dashboards on first load.
- [ ] Confirm rejecting/suspending/deleting from the admin UI updates the list
      without a manual refresh.
- [ ] Spot-check that emails (password reset, if wired to a real provider via
      `nodemailer`) actually arrive — this suite can't verify real inbox
      delivery.

---

## Automated suite setup (for reference)

```bash
npm install                     # picks up @playwright/test from package.json
npx playwright install chromium # downloads the browser binary (one-time)
npm run seed:e2e                # creates e2e.*@dzidzahub.test accounts + fixture course
npm run test:e2e                # headless run
npm run test:e2e:ui             # interactive Playwright UI mode
npm run test:e2e:report         # open the last HTML report
```

Run `seed:e2e` and the suite against a **Neon branch or staging database**,
not production, if at all possible — it creates real rows (4 users, 1
category, 1 course) and the course-approval spec creates a fresh throwaway
course on every run that isn't cleaned up automatically.
