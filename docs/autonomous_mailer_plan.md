# Autonomous Cyclic Mailer Plan

This document outlines the design and implementation of the autonomous email notification system for Hemant Trauma Centre.

## 1. Objective
The goal is to provide a reliable, server-side notification system that alerts the administration about new patient leads without:
- Spamming individual emails for every small update.
- Requiring the Admin Dashboard to be open (client-side dependency).
- Sending immediate notifications that might interrupt workflow.

## 2. Core Logic (The Cyclic Window)
All notifications are strictly governed by a **Cyclic Timer** to prevent inbox clutter and avoid sending redundant data.

### Rules:
- **State Preservation (No Redundancy)**: A record is only included in a mail if its `mailed` status is `FALSE`. Once a batch is sent, all included records are marked `mailed = TRUE`. They will **never** be sent in a subsequent email.
- **Timer Throttling**: The system checks the `last_mailed_at` timestamp. A new batch is only processed if at least **15-30 minutes** have passed since the last successful dispatch.
- **Accumulation**: Leads that arrive while the timer is "cooling down" are simply stored in the database. They will be picked up as a single group once the next window opens.

## 3. Workflow Example
1.  **Patient A & B** submit forms at 10:05 AM. The timer shows only 5 mins since the last mail. **No email sent.**
2.  **Patient C** submits at 10:25 AM. The timer shows 25 mins have passed (Window Open).
3.  **Result**: A single summary email is sent containing **A, B, and C**.
4.  **Patient D** submits at 10:30 AM.
5.  **Result**: Patient D will **not** be sent immediately because a mail was just sent at 10:25 AM. Patient D waits for the next cycle. Patient A, B, and C are **never sent again**.

## 4. Server-Side Triggers
The system is "Autonomous" because it is triggered by standard API events on the server:

1. **New Lead Submission (Step 1)**: Triggers the check.
2. **Lead Update (Step 2)**: Triggers the check.
3. **Heartbeat (Dashboard Sync)**: Triggers the check as a fallback.

## 4. Implementation Details

### Shared Utility: `src/lib/mailer.ts -> processPendingMails()`
```typescript
/**
 * logic flow:
 * 1. Fetch 'last_mailed_at' from DB.
 * 2. Calculate if (Now - last_mailed_at) > 15 minutes.
 * 3. Fetch all appointments where 'mailed' = FALSE.
 * 4. If window open AND unmailed records exist:
 *    a. Send consolidated EmailTemplate.
 *    b. Set 'mailed' = TRUE for those records.
 *    c. Update 'last_mailed_at' = NOW.
 */
```

### Routing
The following endpoints will trigger the check:
- `POST /api/appointments`
- `PATCH /api/appointments`
- `POST /api/admin/appointments/sync`

## 5. Summary of Benefits
- **Zero Lead Loss**: Every record saved is eventually mailed.
- **No Spam**: The admin receives at most 1 email every 15 minutes.
- **Autonomous**: Works 24/7 without any user interaction required.
- **Step 2 Inclusion**: Since we wait 15 minutes, there is a high probability that the patient's Step 2 (message/symptoms) is already in the database before the batch mail is triggered.
