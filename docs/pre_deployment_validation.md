# Pre-Deployment Validation Plan

Before pushing to Vercel, we must verify the "entire functionality" of the application locally to ensure a smooth production launch.

## 1. Build Verification
**Objective**: Ensure the application builds without errors.
- [ ] Run `npm run build`.
- [ ] Verify `vercel.json` and `next.config.mjs` are present.
- [ ] Check for any TypeScript type errors or Lint warnings.

## 2. Core Flows Verification
**Objective**: Test the critical user and admin journeys.

### A. Patient Journey (Frontend)
- [ ] **Home Page Load**: Verify Hero slider images load (no broken placeholders).
- [ ] **Navigation**: Test "Services", "About", "Contact" links scroll/navigate correctly.
- [ ] **Appointment Form**:
    - [ ] Fill Step 1 (Name + Mobile). Click Next.
    - [ ] Fill Step 2 (Email + Message). Submit.
    - [ ] **Expected**: Success screen with countdown timer.
    - [ ] **Database Check**: Verify the new row exists in `appointments` table.

### B. Admin Journey (Backend/Dashboard)
- [ ] **Login**: Access `/admin`. Enter current `ADMIN_SECRET_KEY`.
    - [ ] **Expected**: Dashboard loads with appointment data.
- [ ] **Data Display**: Check that the new patient from Step A appears.
- [ ] **Updates**:
    - [ ] Toggle "Contacted" status.
    - [ ] Toggle "Visited" status.
    - [ ] Add an "Admin Note" and save.
    - [ ] **Expected**: Changes persist after page refresh.

## 3. Email System Verification
**Objective**: Validate the Bulk Email Trigger and Template rendering.
- [ ] **Reset State**: Run `node scripts/reset_state.js` to un-mail leads.
- [ ] **Trigger Sync**: Run `node scripts/trigger_sync.js`.
- [ ] **Inbox Check**:
    - [ ] Verify email received.
    - [ ] **Layout**: Check the 1x2 Vertical Button layout.
    - [ ] **Links**: Click "WhatsApp" and "Call" buttons to ensure they open the correct apps.
    - [ ] **Dashboard Link**: Click "Open Admin Dashboard" and ensure it goes to the correct URL.

## 4. Vercel Configuration Check
- [ ] **Cron Job**: Verify `vercel.json` has the correct `crons` entry.
- [ ] **Env Variables**: Ensure you have the list of 11 variables ready for Vercel (see `deployment_plan.md`).

## 5. Mobile Responsiveness
- [ ] **Admin Dashboard**: Open on mobile view (devtools).
    - [ ] Check card layout (created in previous sessions).
    - [ ] Verify "Call" and "Message" buttons are tappable.

---
**Status**: Ready to Execute.
