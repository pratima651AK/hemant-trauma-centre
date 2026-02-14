# Free Tier Deployment Plan: Vercel + Neon + Free Domain

This guide outlines how to deploy the **Hemant Trauma Centre** website completely for **FREE** using industry-standard tools.

## 🏗️ The Free Stack
1.  **Hosting**: **Vercel** (Hobby Plan) - Free forever for personal/non-commercial use.
    *   *Includes*: SSL (HTTPS), CDN, and Serverless Functions.
2.  **Database**: **Neon** (Free Tier) - Serverless PostgreSQL.
    *   *Includes*: 0.5 GB storage (plenty for thousands of appointments).
3.  **Domain**: **.vercel.app** (Free Subdomain) - e.g., `hemant-trauma.vercel.app`.

---

## 🚀 Phase 1: Database (Neon)
*If you already have a Neon DB connected locally, skip to Phase 2.*

### Step-by-Step Neon Setup
1.  **Sign Up**: Go to [Neon.tech](https://neon.tech) and sign up with GitHub/Google.
2.  **Create Project**:
    *   Click **"New Project"**.
    *   Name: `hemant-trauma-db`.
    *   Region: Select the one closest to your users (e.g., `Singapore` or `Mumbai` for India).
    *   Version: PostgreSQL 16 (or latest default).
3.  **Get Connection String**:
    *   On the **Dashboard**, look for "Connection Details".
    *   Select **"Direct Connection"** (Important!).
    *   Copy the connection string (starts with `postgres://...`).
    *   **Note**: Ensure `?sslmode=require` is at the end. If not, append it.
4.  **Database Migration**:
    *   You will need to run the SQL scripts found in `src/lib/db_schema.sql` (if you have one) or manually create the tables.
    *   *Quick Tip*: You can use the "SQL Editor" in Neon to run `CREATE TABLE` commands directly from your project's logic.

---

## 🛡️ Phase 2: Security (Cloudflare Turnstile)
To prevent spam on your appointment forms, we use Cloudflare Turnstile (a smarter, free CAPTCHA).

1.  **Sign Up**: Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2.  **Add Site**:
    *   Go to **"Turnstile"** on the sidebar.
    *   Click **"Add Site"**.
    *   **Site Name**: `Hemant Trauma Centre`.
    *   **Domain**: `hemant-trauma-centre.vercel.app` (and `localhost` for testing).
    *   **Widget Mode**: `Managed` (Recommended).
3.  **Get Keys**:
    *   Copy **Site Key** -> Vercel env `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
    *   Copy **Secret Key** -> Vercel env `TURNSTILE_SECRET_KEY`.

---

## 🚀 Phase 3: Deploy to Vercel
1.  **Push Code to GitHub**:
    *   Ensure your latest code is on GitHub (we just pushed to the `deployment-vercel` branch).
2.  **Login to Vercel**:
    *   Go to [Vercel.com](https://vercel.com) -> Login with GitHub.
3.  **Import Project**:
    *   Click **"Add New"** -> **"Project"**.
    *   Select `hemant-trauma-centre` from the list.
4.  **Configure Project**:
    *   **Framework**: `Next.js` (Auto-detected).
    *   **Root Directory**: `./` (Default).
5.  **Environment Variables (Critical)**:
    *   Copy these exactly from your local `.env.local`:

| Variable Name | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgres://...` (Your Neon Connection String) |
| `NEXT_PUBLIC_ADMIN_SECRET_KEY` | *(Your chosen admin secret)* |
| `NEXTAUTH_SECRET` | *(A long random string for security)* |
| `NEXTAUTH_URL` | `https://hemant-trauma-centre.vercel.app` (You can update this AFTER deploy) |
| `EMAIL_USER` | `hemanttrauma@gmail.com` |
| `EMAIL_PASS` | *(Your Gmail App Password)* |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`| *(Your Cloudflare Site Key)* |
| `TURNSTILE_SECRET_KEY` | *(Your Cloudflare Secret Key)* |

6.  **Click "Deploy"**.

---

## 🚀 Phase 3: Final Verification
1.  **Wait**: Vercel will build the site (approx. 1-2 mins).
2.  **Visit URL**: Click the screenshot to open your new site (e.g., `hemant-trauma-centre.vercel.app`).
3.  **Update Configuration**:
    *   If your URL is different from what you guessed, go to Vercel -> Settings -> Environment Variables.
    *   Edit `NEXTAUTH_URL` to match your actual deployed domain.
    *   **Redeploy** (Go to Deployments -> Redeploy) if you changed variables.

## ✅ Done!
You now have a production-ready medical website running for free.
