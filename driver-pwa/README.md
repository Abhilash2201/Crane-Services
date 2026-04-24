# Driver PWA — Crane Services Driver App

Progressive Web App (PWA) for crane drivers. Manages job acceptance, real-time GPS tracking, job status updates, and proof-of-completion photo uploads. Installable on Android and iOS directly from the browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19.2 + TypeScript 5.9 |
| Build tool | Vite 7.3 + vite-plugin-pwa 1.2 |
| Routing | React Router DOM 7.13 |
| Styling | Styled Components 6.3 + MUI 7.3 (dialogs) |
| HTTP client | Axios 1.12 (with auth interceptors) |
| Real-time | Socket.IO Client 4.8 |
| Maps | Leaflet 1.9 + React Leaflet 5.0 |
| GPS | Browser Geolocation API |
| Icons | Lucide React |

---

## Project Structure

```
driver-pwa/src/
├── App.tsx                      # Routes + auth guard + state wiring
├── main.tsx                     # Entry point, PWA service worker registration
├── types.ts                     # Job, DriverState, JobStatus types
├── screens/
│   ├── LoginScreen/             # Email/password auth
│   ├── HomeScreen/              # Dashboard: earnings, active job, online toggle
│   ├── JobAlertScreen/          # New job notification with accept / reject
│   ├── ActiveJobScreen/         # Job workflow: reach → start → upload proofs → complete
│   ├── JobsScreen/              # Assigned + completed job list
│   ├── MapScreen/               # Live Leaflet map with driver location
│   └── ProfileScreen/           # Driver info, stats, logout
├── hooks/
│   ├── useDriverApi.ts          # API calls (auth, jobs, profile)
│   ├── useDriverState.ts        # Centralized state with localStorage persistence
│   ├── useGps.ts                # Continuous GPS watch via Geolocation API
│   ├── useRealtimeSocket.ts     # Socket.IO connection management
│   ├── useJobRealtime.ts        # Incoming job dispatch and status events
│   ├── useTrackingEmitter.ts    # GPS ping to server every 15 seconds
│   ├── useNetworkStatus.ts      # Online / offline detection
│   └── useDerivedJobs.ts        # Compute active job, earnings, completed list
├── components/
│   ├── ActiveJobRoute.tsx       # Route guard for active job screen
│   ├── NavigateButton.tsx       # Styled nav button
│   └── ScreenWithNav.tsx        # Layout with bottom navigation
└── lib/
    ├── api.ts                   # Axios instance + token refresh interceptor
    ├── realtime.ts              # Socket.IO factory
    └── leaflet.ts               # Custom Leaflet marker config
```

---

## PWA Configuration

| Setting | Value |
|---|---|
| App name | CraneHub Driver |
| Short name | CraneHub |
| Display | `standalone` (no browser chrome) |
| Theme color | `#0A2540` (navy) |
| Background color | `#F8FAFC` |
| Start URL | `/` |
| Service Worker | Auto-update mode |

**Icons:** 192×192, 512×512, and 512×512 maskable (adaptive icon for Android).

Install the app via the browser's "Add to Home Screen" prompt. The Home screen shows an install banner when running in-browser.

---

## Features

### Login
- Email + password authentication
- JWT tokens stored in `localStorage` under key `"auth"`
- Auto-redirect to Home if already logged in

### Home Dashboard
- Online / offline toggle button
- Today's earnings total
- Active job card with variant, location, and status
- PWA install banner (shown when not in standalone mode)
- Quick navigation to Jobs, Map, Profile

### Job Alert
- Triggered by Socket.IO event `dispatch:job_assigned`
- Displays job details: pickup address, crane variant, capacity, customer info
- **Accept** → updates job status to `en_route`
- **Reject** → updates job status to `cancelled`
- Confirmation dialogs before each action

### Active Job Workflow
Four-stage flow with safety checks at each step:

| Stage | Action | API call |
|---|---|---|
| 1. Assigned | Mark site reached | `PATCH /driver/jobs/:id/status` → `en_route` |
| 2. En Route | Mark work started | `PATCH /driver/jobs/:id/status` → `working` |
| 3. Working | Upload proof photos | `POST /driver/jobs/:id/proofs` |
| 4. Working | Complete job | `PATCH /driver/jobs/:id/status` → `completed` |

- Live job timer counting from start time
- Safety checklist: PPE confirmation, outrigger check, team briefing, proof upload
- MUI confirmation dialogs before status changes

### Job List
- **Assigned tab**: jobs with status `assigned` or `in_progress`
- **Completed tab**: finished jobs with earnings per job
- Only one job can be active at a time (others locked)
- Pull-to-refresh button reloads from `GET /driver/jobs`

### Live Map
- Leaflet map with OpenStreetMap tiles
- Driver location marker (auto-center by default)
- Active job pickup location shown when available
- Auto-center disabled when user pans/zooms
- Default center: Bengaluru (12.9716, 77.5946)
- Online / tracking status indicator

### Profile
- Driver name, phone, email
- Job stats (total completed, total earnings)
- Logout: revokes refresh token + clears state

### Offline Mode
- Detected via `navigator.onLine`
- Visual offline banner + grayscale filter on UI
- Actions disabled when offline
- GPS tracking paused; resumes automatically when back online

---

## GPS Tracking

- Browser Geolocation API with `watchPosition` (high accuracy, 15 s max age)
- Fallback position: Bengaluru (12.9716, 77.5946)
- Tracking emitted every **15 seconds** via Socket.IO while job is active and online
- Emission stops when job completes or driver goes offline

### Socket.IO Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `tracking:update` | `{ jobId, latitude, longitude, speedKmph, heading }` |
| Server → Client | `dispatch:job_assigned` | Full job object |
| Server → Client | `job:status_changed` | `{ jobId, requestId, status }` |

---

## Authentication

**Token storage:** `localStorage` key `"auth"` (JSON):
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "refreshExpiresAt": "ISO date",
  "user": { "id", "name", "email", "role", "phone" }
}
```

**Axios interceptors:**
- Request: adds `Authorization: Bearer {accessToken}`
- Response: on 401, attempts `POST /auth/refresh`, retries once

**Route guard:** Unauthenticated users redirected to `/login`.

---

## State Management

All state managed in `useDriverState` hook, persisted to `localStorage` key `cranehub_driver_state_v1`:

```typescript
{
  user: User | null,
  isOnline: boolean,
  jobs: Job[],
  activeJobId: string | null
}
```

Derived state (active job, earnings, completed list) computed in `useDerivedJobs` with `useMemo`.

---

## API Endpoints Used

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Driver login |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Revoke token |
| GET | `/auth/me` | Driver profile |
| GET | `/driver/jobs` | List assigned jobs |
| PATCH | `/driver/jobs/:id/status` | Update job status |
| POST | `/driver/jobs/:id/proofs` | Upload completion photos (multipart) |

---

## Environment Variables

```env
VITE_API_URL=https://crane-services-backend.onrender.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

The Socket.IO server URL is derived automatically by stripping `/api` from `VITE_API_URL`.

For local development, set `VITE_API_URL=http://localhost:8080/api`.

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

To test PWA features (service worker, install prompt), run a production build:

```bash
npm run build
npm run preview  # http://localhost:4173
```

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR + PWA in dev mode |
| `npm run build` | TypeScript check + production bundle with SW |
| `npm run lint` | ESLint checks |
| `npm run preview` | Preview production build with full PWA features |

---

## Deployment

`vercel.json` is present with SPA rewrite rule (`/* → /index.html`). Deploy to Vercel and set environment variables in the project dashboard.

For Android installation: open the deployed URL in Chrome → browser shows "Add to Home Screen" banner automatically.
