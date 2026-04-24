# Admin Web — Crane Services Admin Portal

React 19 + TypeScript single-page application for platform administrators. Provides full control over users, crane variants, pricing, service requests, payments, and real-time analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2 + TypeScript 5.9 |
| Build tool | Vite 7.3 |
| Routing | React Router DOM 7.13 |
| Styling | Styled Components 6.3 |
| HTTP client | Axios 1.12 (with auth interceptors) |
| Real-time | Socket.IO Client 4.8 |
| Icons | Lucide React |

---

## Project Structure

```
admin-web/src/
├── App.tsx                    # Root routing + auth guard
├── main.tsx                   # React DOM entry, ThemeProvider, BrowserRouter
├── pages/
│   ├── LoginPage.tsx          # Admin login
│   ├── OverviewPage.tsx       # KPI dashboard
│   ├── ManageUsersPage.tsx    # User management (all roles)
│   ├── VariantsPage.tsx       # Crane variants CRUD + variant requests
│   ├── RequestsPage.tsx       # Service requests with live feed
│   ├── PaymentsPage.tsx       # Payment tracking + commission view
│   ├── AnalyticsPage.tsx      # 7-day trends, top owners, status breakdown
│   ├── SettingsPage.tsx       # Pricing config + platform toggles
│   ├── ApprovalsPage.tsx      # (placeholder) Owner document approvals
│   └── DisputesPage.tsx       # (placeholder) Customer dispute management
├── components/
│   ├── layout/AdminLayout.tsx # Sidebar + Topbar + Outlet
│   └── ui/                    # button, card, badge, input, modal, tabs, switch, tooltip
├── hooks/useAuth.ts           # Auth state management
├── lib/
│   ├── api.ts                 # Axios instance + token refresh interceptor
│   └── realtime.ts            # Socket.IO factory
└── styles/
    ├── theme.ts               # Design tokens (colors, shadows)
    └── GlobalStyles.ts        # CSS reset + global defaults
```

---

## Features

### Dashboard (`/overview`)
- KPI cards: total users, total requests, active jobs, total revenue
- Operational alerts: pending requests, active jobs, completed today
- Data source: `GET /admin/overview`

### User Management (`/users`)
- Filter by role: Customers, Crane Owners, Drivers
- Search by name, phone, or email
- Filter by status (Active / Inactive)
- Toggle user status via `PATCH /admin/users/:id/status`

### Crane Variants (`/variants`)
- Full CRUD: create, edit, delete crane variants
- Fields: name, capacity (tons), base charge, base hours, overtime rate, description, active status
- Review owner-submitted variant requests (approve / reject with comment)
- Endpoints: `GET/POST/PATCH/DELETE /admin/variants`, `GET/PATCH /admin/variant-requests`

### Service Requests (`/requests`)
- View all requests with filters (ID, customer, date, status)
- Live operations feed (last 6 Socket.IO events)
- Request detail modal with customer info and location preview
- Real-time events: `tracking:updated`, `job:status_changed`, `request:accepted`
- Data source: `GET /admin/requests`

### Payments (`/payments`)
- Summary: total collected, platform commission (15%), owner payouts pending
- Transaction table: Payment ID, Request, Customer, Owner, Amount, Status, Date
- Data source: `GET /admin/payments`

### Analytics (`/analytics`)
- Requests per day (last 7 days)
- Revenue per day (last 7 days, in INR)
- Request status distribution
- Top owners by job count
- Data source: `GET /admin/analytics`

### Settings (`/settings`)
- **Pricing**: Edit base charge, base hours, overtime rate → `PUT /admin/pricing`
- Commission percentage display (15%)
- SMS / Email template editors (placeholder, not wired)
- Push notifications toggle (placeholder)
- Maintenance mode toggle (placeholder)

---

## Authentication

**Role required:** `admin` only. Any other role is redirected to `/login`.

**Flow:**
1. POST `/auth/login` with email + password
2. `accessToken`, `refreshToken`, and `user` stored in `localStorage` under key `"auth"`
3. Axios request interceptor adds `Authorization: Bearer {accessToken}` to all requests
4. On 401: automatic token refresh via `/auth/refresh`, then retry original request
5. Logout: clears localStorage, redirects to `/login`

---

## Environment Variables

```env
VITE_API_URL=https://crane-services-backend.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

For local development, set `VITE_API_URL=http://localhost:8080/api`.

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production bundle |
| `npm run lint` | ESLint checks |
| `npm run preview` | Preview production build locally |

---

## Design System

**Theme colors:**

| Token | Value | Usage |
|---|---|---|
| `primary` | `#FF6200` | Buttons, active states |
| `navy` | `#0A2540` | Sidebar, headings |
| `success` | `#22C55E` | Active/completed badges |
| `danger` | `#EF4444` | Error states |
| `warning` | `#F59E0B` | Pending badges |

**UI components:** Button (default/outline/ghost/success/danger), Card, Badge (5 variants), Input, Select, Textarea, Modal, Tabs, Switch, Tooltip.

---

## Known Limitations

- Approvals and Disputes pages have no backend integration yet
- Settings — commission, SMS/email templates, maintenance mode, push notifications are UI-only
- Bulk user actions (activate, suspend, delete) are disabled
- CSV export on Payments page is not wired
- No toast notification system (errors shown inline)
