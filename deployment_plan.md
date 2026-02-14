# Deployment Plan for Hemant Trauma Centre

This document outlines the steps to deploy the "Hemant Trauma Centre" Next.js application to production.

## 1. Hosting Architecture
We will use **Vercel** for the Next.js frontend and API routes, and a **Managed PostgreSQL** provider (like Neon, Supabase, or AWS RDS) for the database.

### Components:
*   **Frontend**: Next.js App Router (hosted on Vercel).
*   **Database**: PostgreSQL (Cloud-hosted).
*   **Email**: Gmail SMTP (via Nodemailer).
*   **Authentication**: NextAuth.js (Stateless JWT).

## 2. Prerequisites
1.  **Vercel Account**: [Sign up here](https://vercel.com).
2.  **Database Provider**: We recommend **Neon** (serverless Postgres) or **Supabase** for easy integration with Vercel.
3.  **GitHub Repository**: Push your local code to a GitHub repository.

## 3. Database Setup (Production)
Since your local data is in `hemant_trauma_db`, you need to set up the production database.

1.  **Create Project**: Create a new project in your chosen provider (e.g., Neon).
2.  **Get Connection String**: Copy the `postgres://...` connection string.
3.  **Run Migrations**: You need to apply your schema to the production DB.
    *   You can use a GUI tool like **pgAdmin** or **TablePlus** to connect to the production DB using the connection string.
    *   Run the SQL commands to create the tables:
    
    ```sql
    CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        email VARCHAR(100),
        message TEXT, -- Application Enforced Limit: 2000 characters
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        contacted BOOLEAN DEFAULT FALSE,
        visited BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        mailed BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE system_config (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
    );

    INSERT INTO system_config (key, value)
    VALUES ('last_mailed_at', '1970-01-01T00:00:00.000Z')
    ON CONFLICT (key) DO NOTHING;

    -- Persistent Hash & Auditing Setup
    CREATE TABLE IF NOT EXISTS sync_history (
        id SERIAL PRIMARY KEY,
        fingerprint VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE OR REPLACE FUNCTION update_global_hash() RETURNS TRIGGER AS $$
    DECLARE
      new_hash TEXT;
    BEGIN
      SELECT md5(COALESCE(string_agg(id || ':' || version, '|' ORDER BY id), ''))
      INTO new_hash
      FROM appointments
      WHERE is_deleted = FALSE;

      INSERT INTO system_config (key, value)
      VALUES ('global_hash', new_hash)
      ON CONFLICT (key) DO UPDATE SET value = new_hash;

      INSERT INTO sync_history (fingerprint) VALUES (new_hash);
      DELETE FROM sync_history WHERE id NOT IN (SELECT id FROM sync_history ORDER BY id DESC LIMIT 10);

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_global_hash
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_global_hash();
    ```

## 4. Vercel Deployment Steps
1.  **Import Project**: In Vercel, click "Add New..." -> "Project" and select your GitHub repo.
2.  **Configure Environment Variables**:
    You MUST add the following variables in the Vercel dashboard:

    | Variable | Value | Description |
    | :--- | :--- | :--- |
    | `DATABASE_URL` | `postgres://user:pass@host/db...` | Your Cloud DB connection string. |
    | `ADMIN_SECRET_KEY` | `(Your chosen secure key)` | Master key for admin access. |
    | `NEXTAUTH_URL` | `https://your-project.vercel.app` | The URL of your deployed site. |
    | `NEXTAUTH_SECRET` | `(Generate a random string)` | Used to encrypt session tokens. |
    | `MAILER_ENABLED` | `true` | Enable mailing system. |
    | `MAIL_HOST` | `smtp.gmail.com` | Gmail SMTP host. |
    | `MAIL_PORT` | `587` | Standard SMTP port. |
    | `MAIL_USER` | `aniketorkrishna@gmail.com` | Your sender email. |
    | `MAIL_PASS` | `vuqfryrriqcipcaf` | Your App Password (NOT your login password). |
    | `MAIL_FROM` | `Hemant Trauma Centre <email>` | Sender name configuration. |
    | `MAIL_SECURE` | `false` | Use `false` for port 587 (STARTTLS). |

3.  **Deploy**: Click "Deploy". Vercel will build your app and verify the configuration.

## 5. Post-Deployment Verification
1.  **Visit the Site**: Ensure the homepage loads and images (Hero slider) appear correctly.
2.  **Test Appointment**: Submit a dummy appointment form.
    *   *Check*: Does it show the success screen?
    *   *Check*: Does it appear in your remote Database (check via TablePlus)?
3.  **Access Admin**: Go to `/admin` and login with your `ADMIN_SECRET_KEY`.
    *   *Check*: Do you see the appointment you just created?
4.  **Test Email Sync**: Keep the Admin Dashboard open for > 5 minutes (or manually trigger the API via curl) to verify the bulk email is sent.

## 6. Important Notes
*   **Gmail Limitations**: Personal Gmail accounts have sending limits (approx 500/day). For higher volume, consider switching `MAIL_HOST` to SendGrid, AWS SES, or Resend.
*   **Cold Starts**: Vercel Serverless functions (and Neon DB) may "sleep" after inactivity. The first request might take a few seconds. This is normal.
*   **Security**: Ensure your `ADMIN_SECRET_KEY` is strong.

## 7. Zero-Activity Automation (Optional)
The system is now **Autonomous**—it triggers email batches whenever a visitor submits a form or the admin syncs data.

However, if you have very long periods (e.g., 24 hours) with ZERO visitors and ZERO dashboard use, pending leads might wait until the next activity. To ensure leads are *always* sent within 15 minutes even during zero-activity periods:
1.  **Vercel Cron**: Create a `vercel.json` file in your project root:
    ```json
    {
      "crons": [
        {
          "path": "/api/admin/appointments/hash",
          "schedule": "*/15 * * * *"
        }
      ]
    }
    ```
2.  This will force the server to wake up and check for unmailed leads every 15 minutes regardless of site traffic.
