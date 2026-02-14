# Hemant Trauma Centre - Deployment Handoff

**Project Repository**: [https://github.com/pratima651AK/hemant-trauma-centre](https://github.com/pratima651AK/hemant-trauma-centre)

## 1. Access & Collaboration
To deploy this project, you will need access to the GitHub repository.
*   **Repo Owner**: Please invite the client/developer as a **Collaborator** in GitHub Settings -> Collaborators.
*   **Branches**:
    *   `main`: The main development branch.
    *   `deployment-vercel`: **(Recommended)** The optimized, production-ready branch verified for deployment.

## 2. Deployment Instructions (Vercel)
We recommend using **Vercel** for hosting.

1.  **Create Project**: Log in to Vercel, "Add New Project", and import `hemant-trauma-centre`.
2.  **Select Branch**: Choose `deployment-vercel` as the production branch if asked (or stick to default if merging there).
3.  **Environment Variables**:
    **CRITICAL**: You MUST set these variables in Vercel settings for the app to work.

    | Variable | Description |
    | :--- | :--- |
    | `DATABASE_URL` | PostgreSQL Connection String (e.g., from Neon/Supabase). |
    | `ADMIN_SECRET_KEY` | A secure password for the /admin dashboard. |
    | `NEXTAUTH_URL` | The full URL of your deployed site (e.g., `https://your-site.vercel.app`). |
    | `NEXTAUTH_SECRET` | A random string for session encryption (generate one). |
    | `MAILER_ENABLED` | Set to `true` to enable emails. |
    | `MAIL_HOST` | `smtp.gmail.com` (or other provider). |
    | `MAIL_PORT` | `587` |
    | `MAIL_USER` | The email address sending notifications. |
    | `MAIL_PASS` | App Password (not login password) for the email. |
    | `MAIL_FROM` | e.g. `Hemant Trauma Centre <info@example.com>` |
    | `MAIL_SECURE` | `false` |

## 3. Post-Deployment
*   **Database**: Ensure the production database has the tables created. See `docs/deployment_plan.md` for the SQL schema.
*   **Admin Panel**: Visit `/admin` and login with your `ADMIN_SECRET_KEY` to verify access.

## 4. Support Files
*   **`docs/deployment_plan.md`**: Detailed technical architecture and SQL scripts.
*   **`docs/technical_architecture.md`**: Overview of the system internals.
