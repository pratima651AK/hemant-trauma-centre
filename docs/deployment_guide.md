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

1.  Go to [Neon.tech](https://neon.tech) and Sign Up.
2.  Create a **New Project** (e.g., `hemant-trauma-db`).
3.  **Copy the Connection String**:
    *   Look for the `postgres://...` URL.
    *   Ensure strict SSL mode is enabled (`?sslmode=require`).
    *   **Save this**; you will need it for Vercel.

---

## 🚀 Phase 2: Deploy to Vercel
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
