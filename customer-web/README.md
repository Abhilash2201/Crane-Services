# Customer Web — Crane Services Customer Portal

React 19 + TypeScript SPA for end customers to browse crane types, submit rental requests, track jobs in real time, and manage their profile.

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
| Notifications | react-hot-toast |
| Maps | Google Maps Places API + Geocoding API |
| Icons | Lucide React |

---

## Project Structure

```
customer-web/src/
├── App.tsx                        # Routes + RequireAuth guard
├── main.tsx                       # React DOM entry
├── pages/
│   ├── HomePage.tsx               # Public landing page
│   ├── AuthPage.tsx               # Login / Sign-up
│   ├── NewRequestPage.tsx         # 3-step request wizard
│   ├── DashboardPage.tsx          # Customer request list
│   ├── TrackingPage.tsx           # Live job tracking
│   └── ProfilePage.tsx            # User profile editor
├── components/
│   ├── layout/CustomerLayout.tsx  # Header with location picker + nav
│   └── ui/                        # badge, button, card, input, tabs, textarea
├── lib/
│   ├── api.ts                     # Axios instance + Socket.IO init
│   └── utils.ts                   # cn() class merging helper
└── styles/
    ├── theme.ts                   # Design tokens
    └── GlobalStyles.ts            # CSS reset + Inter font
```

---

## Pages & Features

### Home (`/`) — Public
- Hero section with crane type showcase
- Pricing cards for 8 crane types (25T Mobile, 50T Rough Terrain, 100T Crawler, Tower Crane, Hydra 14T, Pick & Carry, All Terrain 80T, Telescopic 35T)
- "How It Works" 4-step guide
- Customer testimonials

### Auth (`/auth`) — Public
- **Login**: email + password
- **Sign-up**: name, email, phone (optional), password (min 6 chars)
- JWT tokens stored in `localStorage` under key `"auth"`
- Redirects back to the original protected route after login

### New Request (`/request/new`) — Protected
Three-step wizard:

**Step 1 — Variant Selection**
- Filter variants by minimum capacity (tons)
- Displays all active crane types with pricing from `GET /variants`

**Step 2 — Job Details**
- Pickup and drop address via Google Maps Places Autocomplete (India, Bengaluru bounds)
- Date + time scheduler
- Duration in hours
- Load description and special instructions
- Site photo upload (up to 6 images)
- Estimated price calculated from backend pricing rules

**Step 3 — Review & Submit**
- Summary of all selections
- Submits to `POST /customer/requests`, then uploads photos to `POST /customer/requests/:id/photos`

### Dashboard (`/dashboard`) — Protected
- Summary counts: pending, accepted, completed requests
- Tabs: Active | Completed | Cancelled
- Each request card shows pickup/drop address, scheduled date, request ID, status timeline (4-step progress bar)
- "View Live Tracking" button on active requests
- "Download Invoice" on completed requests

### Tracking (`/tracking/:id`) — Protected
- Two-column layout: request details + owner/driver info
- Status timeline (Pending → Accepted → In Progress → Completed)
- Google Maps with live crane marker
- Real-time updates via Socket.IO:
  - `tracking:updated` — GPS lat/lng/speed/heading
  - `job:status_changed` — status transitions
- Cancel button (available while status is pending, accepted, or in_progress)
- Owner and driver contact details

### Profile (`/profile`) — Protected
- View name, email, phone, role, user ID
- Edit profile form → `PUT /auth/me`

### Header (all protected routes)
- Location picker with "Use my location" geolocation
- Address search with Google Geocoding
- Auth-aware nav: Sign Up / Login (anonymous) or avatar dropdown with Dashboard, New Request, Logout (authenticated)

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
- Response: on 401, attempts `POST /auth/refresh`, retries original request once

**Route guard:** `RequireAuth` component checks for `refreshToken` in localStorage; redirects to `/auth?mode=login&next={path}` if missing.

---

## API Endpoints Used

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get profile |
| PUT | `/auth/me` | Update profile |
| PUT | `/auth/location` | Save user location |
| GET | `/variants` | List crane variants |
| GET | `/pricing` | Get pricing rules |
| GET | `/customer/dashboard` | Request summary counts |
| GET | `/customer/requests` | List requests |
| POST | `/customer/requests` | Create request |
| GET | `/customer/requests/:id/tracking` | Tracking details |
| POST | `/customer/requests/:id/photos` | Upload site photos |
| PATCH | `/customer/requests/:id/cancel` | Cancel request |

---

## Socket.IO Events

| Direction | Event | Description |
|---|---|---|
| Client → Server | `join:job {jobId}` | Subscribe to job room |
| Client → Server | `leave:job {jobId}` | Unsubscribe |
| Server → Client | `tracking:updated` | New GPS data |
| Server → Client | `job:status_changed` | Status transition |

Socket connects on login and disconnects on logout, passing the access token in the handshake auth.

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
| `primary` | `#FF6200` | CTA buttons, accents |
| `navy` | `#0A2540` | Header, dark text |
| `success` | `#22C55E` | Completed status |
| `danger` | `#EF4444` | Cancelled, errors |
| `warning` | `#F59E0B` | Pending status |

Typography: Inter font, hero heading `clamp(2rem, 3rem)`.

**UI components:** Button (default/outline/ghost/success), Card, Badge (default/success/warning/outline), Tabs, Input, Textarea.

---

## Deployment

`vercel.json` is present — deploy to Vercel with standard static build settings. Set environment variables in the Vercel project dashboard.
