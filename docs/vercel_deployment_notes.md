# Vercel Test Deployment Notes

## Purpose
This branch `vercel-test-deployment` contains the configuration and scripts necessary to deploy the Hemant Trauma Centre website to Vercel with a Neon Postgres database.

## Key Changes
1.  **Database Migration**:
    -   Switched from local Postgres to Neon Serverless Postgres.
    -   Updated `DATABASE_URL` in `.env.local` (and Vercel env vars).
    -   Created `scripts/init_neon_db.js` to initialize the database schema and sync logic.

2.  **Deployment Configuration**:
    -   Created `vercel.json` to configure Cron Jobs.
    -   **Fix**: Updated cron schedule to `0 0 * * *` (daily) to comply with Vercel Hobby plan limits.
    -   **Fix**: Downgraded `nodemailer` to `^6.9.13` to resolve peer dependency conflicts with `next-auth`.

3.  **Security**:
    -   Ensured `.env` files and `import.env` are excluded from Git via `.gitignore`.
    -   Created `docs/security_checklist.md`.

## Verification
-   Deployment to Vercel Production was successful.
-   URL: `https://kriswithlove-hemant-trauma-centre-p.vercel.app`
