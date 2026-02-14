# System Architecture & Sync Engine

**Drafted**: 2026-01-15
**System**: Hemant Trauma Centre - Appointment Management System

## 1. Overview
The system is built on **Next.js 14+ (App Router)** using a **PostgreSQL** database. It features a public-facing appointment booking system and a secured internal Admin Dashboard.

## 2. Admin Authentication
- **Provider**: NextAuth.js (v4)
- **Strategy**: Credentials Provider (Static Admin Key)
- **Session**: JWT-based, Stateless.
- **Security**:
  - `adminKey` verified against `ADMIN_SECRET_KEY` env variable.
  - Session Token stored in HTTP-Only, Secure Cookie.
  - Session Max Age: **2 Hours**.
  - Rate Limit: 15 requests/minute for sensitive actions.

## 3. The Delta Sync Engine
To provide a "Real-Time" feel without the overhead of WebSockets or Firebase, we implemented a **Delta Synchronization Engine**.

### 3.1. The Problem
Fetching the entire list of thousands of appointments every 60 seconds is wasteful and slow.

### 3.2. The Solution
The client and server communicate via a "Hash Exchange" protocol:

1.  **Client Polling**: Every 60 seconds, the client sends a "State Vector" to `/api/admin/appointments/sync`.
    - `knownVersions`: A map of `{ appointmentID: versionNumber }`.
    - `clientGlobalHash`: An MD5 hash of all current IDs and versions.

2.  **Server Verification**:
    - The server fetches all current IDs and versions from the Database.
    - It computes its own `serverGlobalHash`.

3.  **Diff Calculation**:
    - **Match**: If `clientGlobalHash === serverGlobalHash`, the server responds with `{ synced: true }`. (Payload size: ~50 bytes).
    - **Mismatch**: The server compares individual versions:
        - **Updates**: IDs where server version > client version.
        - **Deletions**: IDs present in client vector but missing/deleted in DB.
    - The server returns *only* the specific rows that changed.

### 3.3. Database Schema Support
To support this, the `appointments` table has:
- `version` (INT): Incremented automatically via a PostgreSQL Trigger on every UPDATE.
- `is_deleted` (BOOLEAN): Soft-delete flag (if used) or hard deletions are tracked by ID absence.

## 5. Autonomous Cyclic Mailer
The system includes a decoupled, server-side notification engine that ensures reliable admin alerts without inbox spam.

### 5.1. The Cyclic Rule
To prevent sending individual emails for every form interaction, we implemented a **15-minute Cyclic Window**:
- **Consolidation**: All leads that arrive within a 15-minute window are bundled into a single summary email.
- **Throttling**: The system checks `system_config.last_mailed_at`. If < 15 minutes have passed, it skips the mail send.
- **State Tracking**: Only records where `mailed = FALSE` are included. Once mailed, they are marked `TRUE` and never sent again.

### 5.2. Reactive Triggers
The mailer is "Autonomous" because it is triggered by standard API entry points rather than a dedicated cron service:
- `POST /api/appointments`: Checked when a new patient starts the form.
- `PATCH /api/appointments`: Checked when a patient adds more details.
- `POST /api/admin/appointments/sync`: Checked every 60s when the Admin Dashboard is open (Heartbeat).

This ensures that even if no one is using the site, the next visitor or the next dashboard sync will eventually "push" the pending leads to the admin's email.
