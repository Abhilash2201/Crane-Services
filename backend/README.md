# Crane Services Backend

Node.js + Express backend using Neon Postgres.

## Quick start

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

API base URL: `http://localhost:8080/api`
Socket URL: `ws://localhost:8080`

## Environment

Copy `.env.example` to `.env` and update values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_DAYS`
- `PORT`
- `CORS_ORIGINS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Route map

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/email/request-otp`
- `POST /api/auth/email/verify-otp`
- `POST /api/auth/password/request-reset`
- `POST /api/auth/password/reset`
- `GET /api/auth/me`

Customer:
- `GET /api/customer/dashboard`
- `POST /api/customer/requests`
- `GET /api/customer/requests`

Owner:
- `GET /api/owner/incoming-requests`
- `POST /api/owner/accept-request`
- `POST /api/owner/assign-driver`
- `GET /api/owner/jobs`

Driver:
- `GET /api/driver/jobs`
- `POST /api/driver/tracking`
- `PATCH /api/driver/jobs/:jobId/status`

Admin:
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/status`
- `GET /api/admin/requests`
- `GET /api/admin/payments`
- `GET /api/admin/tracking/:jobId`

Payments:
- `POST /api/payments/intent`

Webhooks:
- `POST /webhooks/stripe`

## Real-time events (Socket.IO)

Client emits:
- `join:job` with `jobId`
- `leave:job` with `jobId`
- `tracking:update` with `{ jobId, latitude, longitude, speedKmph?, heading? }`

Server emits:
- `tracking:updated`
- `job:status_changed`
- `dispatch:job_assigned`
- `request:accepted`
