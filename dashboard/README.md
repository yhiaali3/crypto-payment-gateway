# CryptoGate Dashboard (Phase 1)

This folder contains the dashboard frontend scaffold for the merchant dashboard (Phase 1).

Quick setup:

```bash
cd dashboard
pnpm install # or npm install
pnpm dev
```

What is included (Phase 1):
- Vite + React + TypeScript
- TailwindCSS
- React Router routes: `/login`, `/register`, `/dashboard`, `/dashboard/payments`, `/dashboard/settings`
- Zustand auth store (JWT storage)
- Basic Dashboard layout (Sidebar + Topbar + responsive)
- Login page UI (no backend auth yet)

Next steps (after Phase 1):
- Connect `useAuthStore.login` to real backend `/api/merchants/login` and persist real JWT
- Add React Query hooks for payments list
- Implement settings page
