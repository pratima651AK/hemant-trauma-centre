# Hemant Trauma Centre - Technical Architecture Documentation

## 1. Overview
This document details the technical architecture of the Hemant Trauma Centre web application. The system is a high-performance, serverless Next.js application designed to handle patient appointments, administrative management, and automated notifications with extreme reliability and efficiency.

---

## 2. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Active/Next.js 16 (App Router) | React framework with Server Components for SEO and performance. |
| **Language** | TypeScript | Strictly typed for robustness. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for responsive design. |
| **Database** | PostgreSQL | Relational database (compatible with Neon/Supabase). |
| **Auth** | NextAuth.js | Stateless JWT-based authentication for Admin routes. |
| **Email** | Nodemailer | SMTP client for transactional emails (Gmail). |
| **Security** | Cloudflare Turnstile | Smart CAPTCHA alternative for spam protection. |
| **Deployment** | Vercel | Serverless hosting platform. |

---

## 3. Core Architecture & Design Patterns

### A. Persistent Hash Synchronization ("Smart Sync")
Instead of polling the entire database or using WebSockets (complex for serverless), we use a novel **Database-Triggered Hash System**.

1.  **The Trigger**: A PostgreSQL trigger (`update_global_hash`) listens for `INSERT`, `UPDATE`, or `DELETE` on the `appointments` table.
2.  **The Calculation**: On any change, the DB calculates an MD5 hash of all active `id:version` pairs and stores it in a separate `system_config` table (Key: `global_hash`).
3.  **The Client Handshake**:
    *   **Phase 1 (Light)**: Client sends its local hash to `/api/admin/sync`. Correctly matching the server's pre-calculated hash results in a `200 OK { synced: true }` response (0 DB reads on appointments table).
    *   **Phase 2 (Heavy)**: If hashes mismatch, Client sends its full version map. Server calculates the "Delta" (only changed rows) and returns them.
4.  **Benefits**:
    *   **O(1) Check**: Sync status check is instant.
    *   **Minimal Bandwidth**: Only changed data is transferred.
    *   **Audit**: `sync_history` table keeps a log of the last 10 state changes.

### B. Reliable Batch Mailing
To prevent email throttling and ensuring reliable delivery:
1.  **Batching**: Emails are not sent instantly. A CRON job (10-min interval) or Admin trigger batches "Unmailed" leads older than 5 minutes.
2.  **Safe-Send Logic**:
    *   The system selects eligible candidates.
    *   Sends the email.
    *   **Critically**: Updates `mailed=true` *only* for the specific IDs included in the email, fixing potential race conditions.
3.  **Cross-Client Template**: Uses a Table-based layout (instead of Flexbox) to ensure perfect rendering in Outlook, Gmail, and Apple Mail.

### C. Stateless Admin Authentication
*   Uses `next-auth` with a Credentials provider.
*   Session is maintained via a secure, HTTP-only JWT cookie.
*   **Security Feature**: If a sync request returns `401 Unauthorized` (session expired), the frontend *immediately* wipes local sensitive data from memory and redirects to login.

### D. Soft Deletion & Archival Strategy
To ensure data integrity while allowing Admin cleanup:
1.  **Soft Delete**: "Deleting" a record only sets `is_deleted = TRUE`.
2.  **Secret Trigger**: Delete mode is hidden behind a 5-second long-press on the Dashboard Logo.
3.  **Archival**: A dedicated "Archive Trash" function moves all soft-deleted records to a separate `archived_appointments` table.
    *   **Atomicity**: Uses a PostgreSQL transaction to `INSERT` into archive and `DELETE` from main table in one step.
    *   **Lazy Creation**: The archive table is created automatically if it doesn't exist.

---

## 4. Database Schema

### `appointments` Table
| Column | Type | Purpose |
| :--- | :--- | :--- |
| `id` | SERIAL (PK) | Unique ID. |
| `name` | VARCHAR | Patient Name. |
| `mobile` | VARCHAR | Primary Contact. |
| `message` | TEXT | Patient's problem. Enforced limit: 2000 chars. Auto-normalized whitespace. |
| `version` | INT | **Critical**: Increments on every update for sync logic. |
| `is_deleted` | BOOLEAN | Soft delete flag (supports sync deltas). |
| `mailed` | BOOLEAN | Track email notification status. |

### `system_config` Table
| Key | Value | Purpose |
| :--- | :--- | :--- |
| `global_hash` | MD5 String | The current "State of Truth" for the app. |
| `last_mailed_at` | ISO Date | Throttling timestamp for mailer. |

---

## 5. API Routes

*   `POST /api/appointments`: Public endpoint for Booking Form (Step 1 & 2).
*   `GET /api/admin/appointments/sync`: The "Smart Sync" engine. Authenticated.
*   `DELETE /api/admin/appointments`: Soft-delete an appointment. Authenticated.
*   `POST /api/admin/archive`: Move soft-deleted items to archive table. Authenticated.
*   `GET /api/admin/appointments/hash`: (Legacy/Fallback) Trigger for batch mailer.

---

## 6. Deployment Strategy

*   **Hosting**: Vercel (Auto-deploy from GitHub).
*   **Database**: Neon Console (Run migration scripts manually).
*   **Environment Variables**: 11 Critical variables (Database connection, Mail credentials, Auth/Admin secrets).
*   **Cron Jobs**: Defined in `vercel.json` to keep the mailer running serverlessly.

---

## 7. Migration & Scripts
The `scripts/` folder contains essential utilities:
*   `migrate_persistent_hash.js`: Sets up the Triggers and Config tables.
*   `seed_patients.js`: Generates dummy data for testing.
## 8. Alternative Strategy: Optimized Hashing

While the current architecture recalculates the global hash on *every* database operation (`INSERT`, `UPDATE`, `DELETE`), allowing for strict consistency, this can be further optimized for extremely high-volume applications.

**Optimization: "Create-Only" Trigger**
Ideally, we can restrict the hash recalculation trigger to fire **only on `INSERT` (Create Record)** operations.
*   **Assumption**: Since updates (Contacted/Visited/Notes) are initiated by the *Admin Dashboard itself*, the Admin client theoretically already knows about these changes and updates its local state optimistically.
*   **Trade-off**: If you have multiple Admins managing the dashboard simultaneously, a "Create-Only" trigger would cause Admin A to *not* see Admin B's updates (like an "Admin Note") until a hard refresh.
*   **Conclusion**: For this version, we chose strict consistency (Trigger on ALL changes) to ensure multi-admin synchronization is perfect, as the performance cost for <10,000 active rows is negligible.

## 9. Architectural Philosophy & Conclusion

The design of the Hemant Trauma Centre application prioritizes **Robustness over Realtime**.

*   **Self-Healing State**: The "Smart Polling + Delta Sync" pattern is superior to WebSockets for this use case. If network connectivity drops, the system naturally "heals" itself on the next successful poll, downloading all missed updates without complex replay logic. Use of "Create-Only" event streams often leads to "drift," where the user's view slowly desynchronizes from the server.
*   **Database as Truth**: By moving the hashing logic to the Database (via Triggers), we decouple state management from the application layer. The Database ensures that the "Global Hash" is always a mathematically perfect representation of the stored data, regardless of race conditions or concurrent edits.
*   **Ethical Reliability**: For a medical trauma centre, showing *stale* or *incorrect* data (e.g., calling a patient who has already been contacted) is a failure. Our strict-consistency approach guarantees that if the Admin Dashboard says "Contacted: No," it is factually correct based on the absolute latest server state. We have traded the millisecond-latency of WebSockets for the guaranteed correctness of Hash Synchronization.
