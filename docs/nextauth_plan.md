# Phase 2: NextAuth.js Integration Plan

**Created**: 2026-01-15
**Objective**: Secure the Admin Dashboard using NextAuth.js (Credentials Provider) to replace the static API key mechanism.

## 1. Installation
- [x] Install `next-auth` package.
- [ ] Generate a robust `NEXTAUTH_SECRET` and add to `.env.local`.

## 2. Configuration (`src/app/api/auth/[...nextauth]/route.ts`)
- Create the main NextAuth configuration file.
- **Provider**: Use `CredentialsProvider`.
- **Logic**: 
  - Compare user input (password) against the `ADMIN_SECRET_KEY` env var.
  - Return a dummy user object `{ id: '1', name: 'Admin', email: 'admin@system' }` on success.
  - Throw error on failure.
- **Pages**: internal NextAuth default pages or custom sign-in page (we'll stick to defaults initially or reuse our UI).

## 3. Session Management (`src/app/provider.tsx` or similar)
- Create a client-side `SessionProvider` wrapper if we need access to `useSession` hook globally, OR simply use `getServerSession` in API routes and `useSession` in the Admin component.
- Actually, for the Admin page (client component), wrapping the root layout in a SessionProvider is common practice.

## 4. Admin Page Refactor (`src/app/admin/page.tsx`)
- **Current State**: Uses `localStorage` + `fetch` headers.
- **New State**:
  - Remove `adminKey` state and `localStorage` logic.
  - Use `useSession()` to check authentication status.
  - If `status === 'loading'`, show spinner.
  - If `status === 'unauthenticated'`, show the Login Form (which will now call `signIn('credentials')` instead of setting local state).
  - If `status === 'authenticated'`, show the dashboard.
- **API Calls**: Remove manual `Authorization` header injection. We will move auth checks to the server-side session.

## 5. API Route Protection (`src/app/api/admin/...`)
- **Target Files**:
  - `src/app/api/admin/appointments/route.ts`
  - `src/app/api/admin/appointments/sync/route.ts`
- **Change**:
  - Remove `request.headers.get('Authorization')` check.
  - Import `getServerSession` and `authOptions`.
  - Validate session: `const session = await getServerSession(authOptions); if (!session) return 401;`

## 6. Implementation Steps
1. **Setup**: Create `src/lib/auth.ts` (for options export) and API route handler.
2. **Backend**: Update Admin APIs to verify session instead of header key.
3. **Frontend**: Update `src/app/admin/page.tsx` to use `signIn` and `useSession`.
