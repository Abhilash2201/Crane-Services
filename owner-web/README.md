# Owner Web — Crane Services Owner Portal

React 19 + TypeScript SPA for crane fleet owners. Covers the full operational lifecycle: receiving customer requests, assigning drivers and cranes, tracking live jobs, managing fleet inventory, and reviewing financial reports.

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
| Maps | Leaflet 1.9 + React Leaflet 5.0 |
| Icons | Lucide React |

---

## Project Structure

```
owner-web/src/
├── App.tsx                        # Routes + RequireAuth guard
├── main.tsx                       # React DOM entry
├── pages/
│   ├── AuthPage.tsx               # Login
│   ├── DashboardPage.tsx          # Overview: KPIs, earnings chart, activity feed
│   ├── LiveRequestsPage.tsx       # Incoming customer requests
│   ├── DispatchPage.tsx           # Assign drivers + cranes to accepted requests
│   ├── TrackingPage.tsx           # Real-time GPS map for active jobs
│   ├── FleetPage.tsx              # Crane inventory management
│   ├── DriversPage.tsx            # Driver account management
│   ├── ActiveJobsPage.tsx         # Currently running jobs
│   └── ReportsPage.tsx            # Revenue + utilization analytics
├── components/
│   ├── layout/MainLayout.tsx      # Collapsible sidebar + sticky header
│   └── ui/                        # button, card, badge, input, modal, tabs, textarea
├── lib/
│   ├── api.ts                     # Axios instance + token refresh interceptor
│   ├── realtime.ts                # Socket.IO factory
│   └── utils.ts                   # cn() class merging helper
└── styles/
    ├── theme.ts                   # Design tokens (colors, shadows, radius)
    └── GlobalStyles.ts            # CSS reset + Inter font
```

---

## Features

### Dashboard (`/dashboard`)
- KPI cards: total cranes, active requests, revenue, fleet utilization %
- 7-day earnings chart
- Recent activity feed (latest job/request events)

### Live Requests (`/requests`)
- Pending requests from customers matching the owner's fleet capacity
- Filter by crane variant and distance
- Accept a request → `POST /owner/accept-request`
- Data source: `GET /owner/incoming-requests`

### Dispatch Board (`/dispatch`)
- List of accepted requests awaiting driver + crane assignment
- Crane suggestions based on required capacity
- Assign driver and crane → `POST /owner/assign-driver`
- Real-time event feed (Socket.IO dispatch confirmations and status updates)
- Data sources: `GET /owner/accepted-requests`, `GET /owner/drivers`, `GET /owner/fleet`

### Live Tracking (`/tracking`)
- Real-time GPS map (Leaflet + OpenStreetMap)
- Auto-centers on latest tracking ping; disabled when user pans
- Job status timeline sidebar
- Driver name, crane registration, job timestamps
- Socket.IO events: `tracking:updated`, `job:status_changed`
- Data source: `GET /owner/requests/:id/tracking`

### Fleet Management (`/fleet`)
- Add, edit, and update crane inventory
- Fields: registration number, capacity (tons), variant, status (active / maintenance)
- Data sources: `GET/POST/PATCH /owner/fleet`, `GET /variants`

### Driver Management (`/drivers`)
- View all drivers linked to this owner
- Create new driver accounts (auto-generated passwords)
- Delete / remove driver assignment
- Data sources: `GET /owner/drivers`, `POST /owner/drivers/create`, `DELETE /owner/drivers/:id`

### Active Jobs (`/jobs`)
- View all currently running jobs with status and location
- Live status updates via Socket.IO
- Data source: `GET /owner/jobs`

### Reports (`/reports`)
- Revenue trends (monthly/weekly view)
- Fleet utilization percentage
- Job count by crane variant

---

## Authentication

**Role required:** `owner` only.

**Flow:**
1. `POST /auth/login` with email + password
2. `accessToken`, `refreshToken`, and `user` stored in `localStorage` key `"auth"`
3. Axios request interceptor adds `Authorization: Bearer {accessToken}` to all requests
4. On 401: automatic token refresh via `POST /auth/refresh`, then retry original request
5. Auth events dispatched via `window.dispatchEvent("auth-changed")` for sidebar sync
6. Logout: `POST /auth/logout`, clears localStorage, redirects to `/auth`

**Route guard:** `RequireAuth` wrapper checks for `refreshToken`; redirects to `/auth` if missing.

---

## API Endpoints Used

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Owner login |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Revoke token |
| GET | `/owner/incoming-requests` | Pending requests matching fleet |
| GET | `/owner/accepted-requests` | Requests ready for dispatch |
| POST | `/owner/accept-request` | Accept a customer request |
| POST | `/owner/assign-driver` | Assign driver + crane to request |
| GET | `/owner/drivers` | List linked drivers |
| POST | `/owner/drivers/create` | Create new driver account |
| DELETE | `/owner/drivers/:id` | Remove driver |
| GET | `/owner/jobs` | All jobs |
| GET/POST | `/owner/fleet` | List / add cranes |
| PATCH | `/owner/fleet/:id` | Update crane status |
| GET | `/owner/requests/:id/tracking` | Job tracking details |
| GET | `/variants` | Available crane variants (active only) |

---

## Socket.IO Events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `dispatch:job_assigned` | Driver assignment confirmation |
| Server → Client | `job:status_changed` | `{ jobId, requestId, status }` |
| Server → Client | `tracking:updated` | `{ latitude, longitude, timestamp, ... }` |

Socket connects on login (access token in handshake auth) and disconnects on logout.

---

## Environment Variables

```env
VITE_API_URL=https://crane-services-backend.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

The Socket.IO server URL is derived by stripping `/api` from `VITE_API_URL`.

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
| `success` | `#22C55E` | Active/completed |
| `danger` | `#EF4444` | Errors, cancelled |
| `warning` | `#F59E0B` | Pending states |

**UI components:** Button (default/outline/ghost/success), Card, Badge, Input, Modal, Tabs.

**Layout:** Collapsible sidebar (full → icon rail) using CSS Grid, sticky header, responsive card grids with `auto-fit` + `minmax()`.

---

## Deployment

`vercel.json` is present. Deploy to Vercel and set environment variables in the project dashboard.
