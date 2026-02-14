# Plan: Persistent Server-Side Fingerprinting

To optimize valid synchronization and provide a history of state changes, we will move from "On-the-Fly" hash calculation to a **Persistent Database Hash**.

## 1. Objectives
*   **Performance**: Reduce the read load on the `appointments` table. The Sync API will read a single row from `system_config` instead of scanning thousands of ID/Versions.
*   **Auditing**: Keep a history of the last 10 hashes to debug when state changes occurred.
*   **Consistency**: Ensure the server has a definitive entity representing the "Current State".

## 2. Database Schema Changes

### A. New Table: `sync_history`
Used for auditing the last 10 changes.
```sql
CREATE TABLE sync_history (
    id SERIAL PRIMARY KEY,
    fingerprint VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### B. Configuration Key
We will use the existing `system_config` table to store the **Current Active Hash** for O(1) access.
*   Key: `global_hash`
*   Value: `(MD5 string)`

## 3. The Trigger Logic (The Core)
We will create a PostgreSQL Trigger that runs `AFTER INSERT OR UPDATE OR DELETE` on the `appointments` table.

**Logic:**
1.  Transaction starts.
2.  Row is modified.
3.  Trigger fires `calculate_global_hash()`.
4.  Function runs:
    ```sql
    SELECT md5(string_agg(id || ':' || version, '|' ORDER BY id)) 
    FROM appointments 
    WHERE is_deleted = FALSE;
    ```
5.  Function updates `system_config SET value = NEW_HASH WHERE key = 'global_hash'`.
6.  Function inserts into `sync_history`.
7.  If `sync_history` > 10 rows, delete oldest.
8.  Transaction commits.

## 4. Modified Sync API Flow
**Current Flow (On-the-Fly):**
1.  Client sends `Hash A`.
2.  Server queries `appointments`.
3.  Server computes `Hash B`.
4.  Compare.

**New Flow (Persistent):**
1.  Client sends `Hash A`.
2.  Server queries `system_config` (Key: `global_hash`).
3.  Server gets `Hash B` instantly.
4.  Compare.

## 5. Implementation Steps
1.  **Migration Script**: Write `scripts/migrate_persistent_hash.js` to create tables and triggers.
2.  **Execute Migration**: Run the script against the DB.
3.  **Update API**: Modify `src/app/api/admin/appointments/sync/route.ts` to query `system_config`.
4.  **Verify**: Test that changing a patient name updates the hash in `system_config`.
