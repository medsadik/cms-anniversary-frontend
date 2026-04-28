# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Run production server
```

> Both TypeScript and ESLint errors are intentionally ignored during builds (`next.config.mjs`). Fix them in-editor, not by adjusting build config.

## Architecture

**What this is:** A Next.js 14 admin panel for managing employee birthday/anniversary email automation. It connects to a Spring Boot backend (`NEXT_PUBLIC_API_URL`, default `http://localhost:8080`) and uses Keycloak for SSO.

### Routing

Uses the Next.js App Router. All authenticated pages live under `app/(dashboard)/` (route group with shared layout). The root `app/page.tsx` immediately redirects to `/dashboard`. Authentication is handled in `app/keycloak/` using `oidc-client-ts`.

### Data Flow

`lib/api.ts` — single Axios instance used everywhere. It has an interceptor that redirects to `/login` on 401. There is a **demo/mock mode** (disabled by default via `DEMO_MODE` constant) that intercepts requests and returns hardcoded data — useful for offline work. When a real network request fails, the interceptor can fall back to mock data automatically.

Real endpoints consumed:
- `GET /api/stats/weekly`, `/api/employees`, `/api/employees/birthdays-this-week`, `/api/employees/anniversaries-this-week`
- `GET/POST/PUT/DELETE /api/templates/{id}`
- `GET /api/email-logs/sent-today`, `/api/default-cc`
- `POST /api/sync`, `/api/templates/test-email`

### Auth

`app/client-providers.tsx` wraps the entire app with `AuthProvider` (Keycloak/OIDC), `I18nProvider`, and `Toaster`. The Keycloak config lives in `app/keycloak/keycloakConfig/index.ts` — authority is `http://192.168.1.160:8080/realms/cms`, client ID `front`. Silent token renewal is enabled. `components/auth-guard.tsx` protects dashboard routes.

### i18n

Custom context-based system — no external library. `lib/i18n/translations.ts` holds all EN/FR strings (300+ keys). `hooks/use-translation.ts` is the hook to access them. Language preference persists in `localStorage`.

### UI Components

Shadcn/ui (New York style, neutral base color) built on Radix UI primitives. Components live in `components/ui/`. Import path alias `@/` maps to the repo root. Icons are Lucide React.

### Key Component Patterns

- Feature dialogs are co-located as `components/employee-*.tsx`, `components/template-*.tsx`
- Forms use React Hook Form + Zod validation
- Rich text email bodies use React Quill
- Charts (dashboard stats) use Recharts
- Toast notifications via Sonner (`hooks/use-toast.ts`)
