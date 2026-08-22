# ePharmacy Rwanda — Frontend

A multi-role digital pharmacy platform built for the Rwandan healthcare ecosystem. It connects patients, pharmacies, insurance providers, government regulators, and system administrators through a single, role-aware web application.

> **Current state:** The data layer is fully mock (localStorage-based) and structured to mirror the NestJS backend API. Switching to live API calls requires updating the service files to use the configured Axios client.

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5.6 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 (custom `health.*` and `pharmacy.*` color tokens) |
| Routing | React Router DOM 6 |
| State management | Zustand 5 |
| Server state / caching | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| HTTP client | Axios 1.x |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
npm install
```

### Environment

Create a `.env` file at the project root:

```env
VITE_API_URL=https://api.epharmacy.gov.rw/v1
```

If `VITE_API_URL` is not set, the Axios client defaults to `https://api.epharmacy.gov.rw/v1`.

### Run

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## Project Structure

```
src/
├── api/                   # Axios instance with auth + refresh token interceptors
├── assets/                # Static images
├── components/
│   ├── common/            # Shared brand components (LogoBrand)
│   ├── patient/           # Patient-specific components (MedicineCard, MedicineSearchBar, PrescriptionUploader, ConfirmationDialog, etc.)
│   └── ui/                # Generic UI primitives (Button, Card, Badge, Table, StatCard, AlertBadges)
├── config/
│   └── insurance-rates.ts # Coverage rate constants per insurance provider
├── hooks/
│   └── useMedicineSearch.ts
├── layouts/
│   ├── AuthLayout.tsx     # Wrapper for public auth pages
│   ├── NavShell.tsx       # Top nav shell
│   └── SidebarLayout.tsx  # Role-specific sidebar + outlet
├── pages/
│   ├── admin/             # Dashboard, Users, Medicines, Roles, Settings, AuditLogs
│   ├── government/        # Dashboard, PharmacyRegistry, MedicineRegistry, NationalAnalytics, DistrictAnalytics, ProvinceAnalytics, MedicineAnalytics, Compliance, Reports
│   ├── insurance/         # Dashboard, Claims, Payments, Reports, Patients
│   ├── patient/           # Dashboard, MedicineSearch, MedicineDetails, Reservations, History, Notifications, Profile
│   ├── pharmacy/          # Dashboard, Inventory, Reservations, Patients, InsuranceClaims, StaffManagement, AuditTrail, Reports, Settings, Notifications, Profile
│   └── public/            # Landing, Login, PatientRegister, PharmacyRegister, ForgotPassword, ChangePassword
├── routes/
│   ├── index.tsx          # All route definitions
│   ├── ProtectedRoute.tsx # Role guard + firstLogin redirect
│   └── PublicRoute.tsx    # Redirects authenticated users to their portal
├── services/
│   ├── auth-api.ts        # Auth service (mock — localStorage backed)
│   ├── medicine-api.ts    # Medicine / pharmacy / reservation service (mock)
│   └── token-storage.ts   # JWT token helpers (localStorage)
├── store/
│   ├── authStore.ts       # Zustand auth state (user, token, login, logout)
│   └── uiStore.ts         # Zustand UI state (sidebar open, notification count)
├── styles/
│   ├── globals.css
│   └── variables.css
├── types/
│   └── index.ts           # All shared TypeScript types
├── utils/
│   └── rwanda-locations.ts # Province / district / sector data
├── App.tsx
└── main.tsx
```

---

## User Roles & Portals

Each role has an isolated route prefix and a role-specific sidebar.

| Role | Path prefix | Key capabilities |
|---|---|---|
| `PATIENT` | `/patient` | Search medicines, view pharmacy availability, upload prescriptions, make and cancel reservations, insurance co-pay calculation |
| `PHARMACY` | `/pharmacy` | Manage inventory and pricing, process reservations, manage staff, insurance claims, audit trail, reports |
| `INSURANCE` | `/insurance` | Review claims, view co-payment splits, manage payments, patient records, reports |
| `GOVERNMENT` | `/government` | Pharmacy registry (approve/reject/suspend), national and regional analytics, medicine registry, compliance, MOH reports |
| `ADMIN` | `/admin` | User management, medicine catalogue, role/permission management, system settings, audit logs |

---

## Authentication

- Auth state is held in Zustand (`authStore`). On boot, `isAuthenticated` is derived from the presence of a stored JWT in `localStorage`.
- `ProtectedRoute` enforces role-based access and redirects unauthenticated or wrong-role users.
- `PublicRoute` redirects already-authenticated users to their portal home.
- A `firstLogin` flag on the user object forces a password change via `/change-password` before any protected page is accessible.
- The Axios client in `src/api/client.ts` attaches `Authorization: Bearer <token>` to every request and includes a 401-intercept with a refresh token queue, ready for backend integration.

### Demo Credentials (mock mode)

| Role | Username | Password |
|---|---|---|
| Patient | `patient` | `PatientPass123!` |
| Government | `government` | `GovPass123!` |
| Admin | `admin` | `AdminPass123!` |
| Pharmacy (Kigali National) | `staff` | `TempPass123!` |
| Pharmacy (Gikondo District) | `manager` | `ManagerPass123!` |
| RSSB Insurance Portal | `rssb@epharmacy.local` | `InsurancePass123!` |
| MMI Insurance Portal | `mmi@epharmacy.local` | `InsurancePass123!` |

Password reset OTP code (mock): **123456**

---

## Key Features

### Patient
- Full-text medicine search across name, generic name, trade names, manufacturer, and category
- Pharmacy availability cards with distance, open/closed status, stock level badges, insurance provider tags, and RWF pricing
- Insurance coverage calculator (RSSB, MMI, SANLAM, Radiant) with patient/insurer co-pay split
- Prescription file upload (PDF / JPG / PNG, max 10 MB) with a progress indicator
- Reservation flow with a generated pickup code and a 24-hour pickup deadline
- Reservation cancellation with automatic stock reconciliation
- Favourite medicines and pharmacies
- Search history (last 20 queries)

### Pharmacy
- Inventory CRUD with live stock level and pricing updates persisted to `localStorage`
- Reservation management queue (PENDING → CONFIRMED → COLLECTED)
- Staff and role management
- Revenue and dispensing reports with Chart.js visualisations
- Audit trail log

### Government / Regulatory
- Pharmacy application lifecycle: `PENDING_VERIFICATION` → `APPROVED` / `REJECTED` / `SUSPENDED` / `MORE_INFO_REQUESTED`
- National, provincial, and district analytics dashboards
- Medicine availability heatmaps and critical shortage alerts

### Admin
- RBAC: role definitions and per-user permission arrays
- Platform-wide audit logs

---

## API Integration

The app is mock-first. All data lives in `src/services/` and `localStorage`.

To connect to the real NestJS backend:

1. Set `VITE_API_URL` to the backend base URL.
2. Replace the mock function bodies in `auth-api.ts` and `medicine-api.ts` with calls to `apiClient` (the configured Axios instance in `src/api/client.ts`).
3. The refresh token intercept in `apiClient` has commented-out stubs showing the expected response shape — uncomment and adjust to match the backend contract.
4. Consider wrapping service calls in TanStack React Query hooks (`useQuery` / `useMutation`) — the `QueryClientProvider` is already in place in `App.tsx`.

---

## Rwanda-Specific Context

- All administrative location fields use Rwanda's five-level hierarchy: **Province → District → Sector → Cell → Village**.
- Insurance providers are the four major Rwandan schemes: **RSSB, MMI, SANLAM, Radiant**.
- Pricing is in **RWF (Rwandan Franc)**.
- The pharmacy regulatory workflow mirrors the **Ministry of Health (MOH)** licensing process.
- The national medicine catalogue seeds use drugs commonly distributed through Rwanda's public health system (e.g., Coartem for malaria).
