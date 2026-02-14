# Refinement Plan: Data Normalization & Mobile UX

**Created**: 2026-01-15
**Status**: Completed

## 1. Backend Data Normalization
**Objective**: Ensure consistent data storage format for better searchability, cleanliness, and robustness in the database.

- **Target File**: `src/app/api/appointments/route.ts`
- **Changes**:
  - In `POST` method:
    - **Name**: Convert to lowercase and trim: `name.trim().toLowerCase()`.
    - **Email**: Normalize (lowercase + trim) if provided: `email.trim().toLowerCase()`.
    - **Mobile**: Sanitize to ensure only digits are stored: `mobile.replace(/\D/g, '').slice(-10)`.
    - **Message**: Trim whitespace (if provided).
  - In `PATCH` method (if applicable for updates):
    - Apply same normalization to `email` and `message` updates.

## 2. Frontend Mobile User Experience
**Objective**: Simplify data entry for mobile users by ensuring the correct keypad appears and limiting input length.

- **Target File**: `src/components/AppointmentForm.tsx`
- **Changes**:
  - Update the `mobile` input field.
  - Add `inputMode="numeric"`: Hints to browsers to show a numeric keypad.
  - Add `pattern="[0-9]*"`: Strictly enforces numeric input for some mobile browsers (like iOS).
  - Add `maxLength={10}`: Prevents user from entering more than 10 digits directly in the HTML.
  - Ensure `type="tel"` remains (already present).

## 3. Implementation Steps
1. **Frontend**:
   - Open `src/components/AppointmentForm.tsx`.
   - Locate the input with `name="mobile"`.
   - Add attributes: `inputMode="numeric"`, `pattern="[0-9]*"`, and `maxLength={10}`.

2. **Backend**:
   - Open `src/app/api/appointments/route.ts`.
   - In the `POST` handler, update data preparation:
     ```typescript
     const nameToSave = name?.trim().toLowerCase();
     const emailToSave = email?.trim().toLowerCase() || null;
     const mobileToSave = mobile?.replace(/\D/g, '').slice(-10);
     const messageToSave = message?.trim() || null;
     ```
   - Update the SQL query variable array (`values`) to use these normalized variables.

## 4. Admin Dashboard UI
**Objective**: Ensure appointment names are displayed in Title Case (Capital Case) regardless of database storage format.

- **Target File**: `src/app/admin/page.tsx`
- **Changes**:
  - Locate the `<h3>` tag displaying `app.name`.
  - Add the Tailwind utility class `capitalize` to the `className` attribute.
  - This ensures "john doe" renders as "John Doe".

## 5. Completion Summary
- **Backend Data Normalization**: Implemented in `/api/appointments/route.ts` (trim, lowercase, sanitization).
- **Frontend Mobile UX**: Implemented in `AppointmentForm.tsx` (`inputMode`, `pattern`).
- **Admin Dashboard UI**: Implemented in `admin/page.tsx` (Capitalization, Card Layout, Contact Actions).

