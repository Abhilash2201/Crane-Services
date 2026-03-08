# Crane Services Backend

Node.js + Express backend using Neon Postgres.

## Quick start

```bash
cd backend
npm install
npm run dev
```

API base URL: `http://localhost:8080/api`

## Environment

Copy `.env.example` to `.env` and update values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`

## Route map

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
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
