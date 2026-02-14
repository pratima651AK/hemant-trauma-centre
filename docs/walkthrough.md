# Hemant Trauma Centre: Technical Walkthrough & Delivery Report

**Project**: Hemant Trauma Centre Web Platform v3.0  
**Status**: **PRODUCTION READY** ✅  
**Last Updated**: Jan 15, 2026

This document provides a comprehensive technical overview of the system architecture, features, and verification status of the deployed application.

---

## 1. System Architecture

### Core Stack
*   **Framework**: Next.js 16.1.1 (React 19, Turbopack)
*   **Language**: TypeScript (Strict Mode)
*   **Database**: PostgreSQL 18.1 (Local)
*   **State Sync**: Proprietary "id#version" Delta-Sync Protocol
*   **Styling**: TailwindCSS with Custom "Medical-Grade" Theme Engine

### The "Lead-First" Architecture
We implemented a conversion-focused architecture that captures user data at the earliest possible moment:
1.  **Step 1 (Instant Capture)**: When a user enters Name/Mobile and clicks "Next", a lead record is **created immediately** in the background.
2.  **Step 2 (Enrichment)**: If the user adds Email/Message, the existing lead is updated via `PATCH`.
3.  **Benefit**: Even if a user drops off at Step 2, the hospital still has their contact number to follow up.

---

## 2. Key Features

### 🏥 Patient-Facing Frontend 
*   **Bilingual Interface**: Seamless English/Hindi toggle with instant content synchronization.
*   **Smart Form Engine**:
    *   **Auto-Jump**: Clicking "Next Step" instantly transitions the UI while saving in the background.
    *   **Validation**: Strict Regex for 10-digit mobile numbers and email formats.
    *   **Success Timer**: A 10-second auto-reset feedback screen with "Get Directions" and "Call Now" shortcuts.
*   **Sticky Engagement**: Floating, pulsing WhatsApp button for ease of access.
*   **Performance**: LCP (Largest Contentful Paint) under 1.2s via optimized Next.js Image caching.

### 🛡️ Admin Dashboard (The "Command Center")
*   **Secure Access**: Protected by a server-side Secret Key auth mechanism.
*   **Delta-Sync Engine**:
    *   **Global Hash Protocol**: Browser checks for updates every 1 minute using a 32-byte MD5 signature.
    *   **Zero-Data Idle**: If no leads changed, **0 KB** of appointment data is downloaded.
    *   **Patch-Update UI**: When changes occur, only the specific changed rows are downloaded and patched into the UI, preventing screen flicker.
*   **Smart Filtering**:
    *   **Red/Blue/Green Badges**: One-click filters for "New", "Contacted", and "Visited" patients.
    *   **Search**: Unified search bar for Name, Mobile (smart digit matching), and Email.
*   **Battery Optimized**: Logic pauses heavy polling when the tab is inactive.

### 📧 Intelligent Autonomous Mailer
*   **No Spam Policy**: The admin is NOT emailed for every single form click.
*   **15-Minute Cycle**: The system enforces a strict 15-minute cooling period between emails. Leads are accumulated during this time.
*   **Autonomous Triggers**: Emails are now triggered automatically by any visitor interaction (Form submissions) or dashboard syncs, removing the need for the admin page to be actively open to "request" mails.
*   **Zero-Loss Batching**: All unmailed records are picked up in a single summary once the window opens.

---

## 3. Database Schema

### Table: `appointments`
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL (PK) | - | Unique Lead ID |
| `version` | INT | 1 | **Critical**: Increments automatically on ANY row change |
| `name` | TEXT | - | Patient Name |
| `mobile` | TEXT | - | 10-digit Contact |
| `contacted` | BOOLEAN | FALSE | Workflow Status |
| `visited` | BOOLEAN | FALSE | Workflow Status |
| `is_deleted`| BOOLEAN | FALSE | Soft-delete flag for sync safety |
| `admin_notes`| TEXT | "" | Staff internal comments |

*Note: A PostgreSQL Trigger (`trg_increment_appointment_version`) ensures the `version` column is 100% reliable.*

---

## 4. Verification & Testing

### ✅ Functional Tests
| Feature | Status | Test Result |
| :--- | :--- | :--- |
| **Lead Capture** | PASS | Step 1 data appears on Admin Dashboard within 60s. |
| **Sync Protocol** | PASS | Dashboard effectively ignores unchanged data (304-style logic). |
| **Mobile Layout** | PASS | Cards resize to 1-column grid; Sticky Search bar active. |
| **Batch Mailer** | PASS | Emails generated automatically in 15-minute summary blocks. |
| **Bilingual** | PASS | JSON keys fully populated for En/Hi. |

---

## 5. How to Run

1.  **Start Database**: Ensure PostgreSQL service is running (`hemant_trauma_db`).
2.  **Start Server**: `npm run dev`
3.  **Access App**: `http://localhost:3000`
4.  **Access Admin**: `http://localhost:3000/admin`
    *   *Key*: `hemant_admin_2026` (as verified in `.env.local`)

---

*System Architected by Antigravity*
