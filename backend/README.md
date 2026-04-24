# Backend — Crane Services API

Node.js + Express REST API with Socket.IO for real-time updates, Prisma ORM on Neon PostgreSQL, and Stripe payment processing. Serves all four frontends (admin, customer, owner, driver).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 4.19 |
| ORM | Prisma 6.5 |
| Database | Neon PostgreSQL (serverless) |
| Auth | JWT + bcryptjs, refresh token rotation |
| Real-time | Socket.IO 4.8 |
| Payments | Stripe 18 |
| Email | Resend API / Nodemailer (SMTP fallback) |
| Validation | Zod |
| Docs | Swagger UI (`/api/docs`) |

---

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point — Express + Socket.IO init
│   ├── app.js                 # Middleware setup, route mounting
│   ├── config/env.js          # Env validation
│   ├── db/
│   │   ├── neon.js            # Neon PostgreSQL connection
│   │   └── init.js            # Bootstrap tables on startup
│   ├── routes/                # One file per domain
│   │   ├── auth.routes.js
│   │   ├── customer.routes.js
│   │   ├── owner.routes.js
│   │   ├── driver.routes.js
│   │   ├── admin.routes.js
│   │   ├── payments.routes.js
│   │   ├── pricing.routes.js
│   │   ├── health.routes.js
│   │   └── webhooks.routes.js
│   ├── middlewares/
│   │   ├── auth.js            # requireAuth + authorize(roles)
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── authTokens.js      # JWT lifecycle, refresh token rotation
│   │   ├── otp.js             # OTP generation + verification
│   │   ├── mailer.js          # Email via Resend or SMTP
│   │   └── pricing.js         # Price calculation engine
│   ├── sockets/index.js       # Socket.IO rooms and event handlers
│   └── utils/                 # asyncHandler, jwt, crypto, httpError
├── prisma/
│   ├── schema.prisma          # Data models
│   └── migrations/            # Prisma migration history
└── uploads/                   # Local file storage (requests/, job-proofs/)
```

---

## Data Models

| Model | Purpose |
|---|---|
| `User` | Multi-role account (admin / customer / owner / driver) |
| `Request` | Customer crane service request |
| `Job` | Active job — links Request ↔ Driver with status tracking |
| `TrackingEvent` | GPS ping from driver (lat, lng, speed, heading) |
| `Payment` | Stripe or manual payment record |
| `RefreshToken` | Hashed token store for rotation & revocation |
| `OtpVerification` | Email/password OTP (10 min TTL, max 5 attempts) |
| `PaymentWebhookEvent` | Stripe webhook audit log |

Additional tables created at startup: `crane_variants`, `pricing_rules`, `fleet`, `owner_drivers`, `request_photos`, `job_proofs`, `variant_requests`.

---

## API Reference

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Database health check |
| GET | `/api/variants` | List crane variants |
| GET | `/api/pricing` | Get pricing (filter by variantId or capacityTons) |
| GET | `/api/docs` | Swagger UI |
| POST | `/webhooks/stripe` | Stripe webhook handler |

### Auth (`/api/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account with role |
| POST | `/login` | Login → returns access + refresh tokens |
| POST | `/refresh` | Rotate tokens |
| POST | `/logout` | Revoke refresh token |
| POST | `/email/request-otp` | Send email verification OTP |
| POST | `/email/verify-otp` | Verify email |
| POST | `/password/request-reset` | Send password reset OTP |
| POST | `/password/reset` | Reset password |
| GET | `/me` | Current user profile |
| PUT | `/me` | Update profile |
| PUT | `/location` | Update address + coordinates |

### Customer (`/api/customer`) — role: customer

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Summary counts by status |
| POST | `/requests` | Create crane request |
| GET | `/requests` | List own requests |
| GET | `/requests/:id/tracking` | Request details + live tracking |
| PATCH | `/requests/:id/cancel` | Cancel request |
| POST | `/requests/:id/photos` | Upload site photos (max 6) |

### Owner (`/api/owner`) — role: owner

| Method | Path | Description |
|---|---|---|
| GET | `/incoming-requests` | Pending requests matching fleet |
| GET | `/accepted-requests` | Owner's accepted requests |
| POST | `/accept-request` | Accept a pending request |
| POST | `/assign-driver` | Assign driver + crane to request |
| GET/POST | `/drivers` | List / add drivers |
| POST | `/drivers/create` | Create new driver account |
| DELETE | `/drivers/:id` | Remove driver assignment |
| GET | `/jobs` | All jobs |
| GET/POST | `/fleet` | List / add fleet items |
| PATCH | `/fleet/:id` | Update fleet item |
| GET/POST | `/variant-requests` | Manage crane variant requests |
| GET | `/requests/:id/tracking` | Track a job |

### Driver (`/api/driver`) — role: driver

| Method | Path | Description |
|---|---|---|
| GET | `/jobs` | Assigned jobs |
| POST | `/tracking` | Submit GPS location update |
| PATCH | `/jobs/:jobId/status` | Update job status |
| POST | `/jobs/:jobId/proofs` | Upload completion proofs |

### Admin (`/api/admin`) — role: admin

| Method | Path | Description |
|---|---|---|
| GET | `/overview` | Platform KPIs |
| GET | `/users` | All users |
| PATCH | `/users/:id/status` | Enable / disable user |
| GET/POST | `/variants` | Crane variant CRUD |
| PATCH | `/variants/:id` | Update variant |
| DELETE | `/variants/:id` | Delete variant |
| GET | `/variant-requests` | Owner variant requests |
| PATCH | `/variant-requests/:id` | Approve / reject |
| GET/PUT | `/pricing` | View / update pricing rules |
| GET | `/requests` | All service requests |
| GET | `/payments` | All payments |
| GET | `/tracking/:jobId` | Full tracking history |
| GET | `/analytics` | 7-day analytics breakdown |

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join:job` | `{ jobId }` | Subscribe to job tracking room |
| `leave:job` | `{ jobId }` | Unsubscribe from job room |
| `tracking:update` | `{ jobId, latitude, longitude, speedKmph?, heading? }` | Driver GPS ping |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `tracking:updated` | TrackingEvent object | New GPS data for a job |
| `job:status_changed` | `{ jobId, requestId, status }` | Job status transition |
| `dispatch:job_assigned` | Job object | Driver assigned to job |
| `request:accepted` | Request object | Request accepted by owner |
| `variant_request:created` | Variant object | New variant request submitted |
| `variant_request:updated` | Variant object | Admin approved / rejected variant |

---

## Pricing Engine

Default rules (admin-configurable):
- **Base charge**: ₹3,000 for the first 3 hours
- **Overtime rate**: ₹1,000 per hour thereafter

Per-variant pricing can override defaults. Capacity-based lookup selects the matching crane automatically.

---

## Business Flow

```
Customer creates request (pending)
  └─ Owner sees matching requests (fleet capacity check)
       └─ Owner accepts request → assigns driver + crane
            └─ Driver receives job (Socket.IO: dispatch:job_assigned)
                 └─ Driver updates status: en_route → working → completed
                      └─ Real-time GPS via tracking:update every 15s
                           └─ Payment via Stripe → webhook updates payment record
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# JWT
JWT_SECRET="long-random-secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_DAYS=30

# Server
PORT=8080
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176"

# Email — Resend (primary)
RESEND_API_KEY="re_xxxxx"

# Email — SMTP (fallback)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
SMTP_FROM="noreply@crane-services.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:deploy

# Start development server (port 8080)
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Production start |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate:dev` | Create + apply migration in development |
| `npm run prisma:migrate:deploy` | Apply migrations in production |

---

## File Uploads

- **Request photos**: `POST /api/customer/requests/:id/photos` — max 6 images, 5 MB each
- **Job proofs**: `POST /api/driver/jobs/:jobId/proofs` — max 6 images, 5 MB each
- Stored locally under `uploads/` (configure cloud storage for production)
