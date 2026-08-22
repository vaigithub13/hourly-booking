# Local Dev Setup

For a **free public API + admin** you can share with Flutter, follow [DEPLOY.md](./DEPLOY.md) and send [SHARE.md](./SHARE.md).

## What you have
- `BE/` — Fastify + TypeScript + Sequelize (PostgreSQL) API, forked from your reference project,
  with three new modules added: `hotel`, `room` (RoomType + Room), `booking` (the hourly-slot engine).
- `ADMIN/` — React + MUI admin panel, forked as-is. Not yet wired to the new hotel/booking endpoints —
  see "Next steps" below.

## 1. Prerequisites
- Node.js 20 (`nvm install` — a `.nvmrc` is already there)
- Yarn 1.x (`corepack enable`)
- Docker Desktop (for Postgres + Redis locally, no local Postgres install needed)

## 2. Backend

```bash
cd BE
cp .env.example .env
```

Edit `.env` and fill in at minimum:
```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_booking
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-change-me
JWT_EXPIRE=7d
API_HOST=http://localhost:8080
FE_HOST=http://localhost:3000
ADMIN_EMAIL=admin@local.dev
ADMIN_PASSWORD=Admin123!
ENABLE_SEED=true
```
(Leave AWS/SendGrid/Twilio/SkipCash/OneSignal/SendBird blank for now — those integrations
are optional until you actually need image uploads, SMS OTP, and payments.)

Start Postgres + Redis:
```bash
docker compose -f docker-compose.dev.yml up -d
```

Install deps and run:
```bash
yarn install
yarn dev
```
The API should come up on `http://localhost:8080`. Sequelize is configured to sync models against
the DB in dev, so the new `hotels`, `room_types`, `rooms`, `bookings` tables will be created automatically.

Swagger/OpenAPI docs are already wired via `@fastify/swagger` — check `http://localhost:8080/documentation`
(or whatever route the existing `src/app.ts` mounts it on) once it's running, to see every endpoint
including the new `/hotels`, `/rooms`, `/bookings` routes.

## 3. Admin panel

```bash
cd ADMIN
cp .env .env.local   # already has an API base URL var — point it at http://localhost:8080
yarn install
yarn start
```
Runs on `http://localhost:3000`. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded.

## 4. What's new vs. the original template

| File | Purpose |
|---|---|
| `BE/src/modules/hotel/*` | Hotel CRUD (owned by a Vendor), approval flow |
| `BE/src/modules/room/*` | RoomType (pricing) + Room (physical bookable unit) |
| `BE/src/modules/booking/*` | The hourly booking engine — availability check + transactional, race-safe booking creation |
| `BE/docker-compose.dev.yml` | One-command local Postgres + Redis + pgAdmin |

## 5. Next steps (in priority order for an hourly-booking app)
1. **Admin UI for Hotel/RoomType/Room/Booking** — clone the existing `ADMIN/src/app/views/admin/products`
   and `.../orders` folders as templates; the table/form patterns transfer directly.
2. **Payment integration on booking confirm** — reuse `BE/src/modules/payment` (SkipCash is already wired),
   trigger it right after `POST /bookings` returns a `pending_payment` booking.
3. **Redis-backed slot lock** (optional, for scale) — a short-lived lock keyed by `roomTypeId` +
   time window in front of `createBooking`, so concurrent requests fail fast instead of queueing on
   the DB row lock. Not required for correctness (the transaction already guarantees that), only for UX
   under heavy concurrent demand.
4. **Push notifications for booking status** — OneSignal plugin already exists, hook it into
   `booking.service.ts` status transitions.
5. **Flutter app** — auth (JWT, same as this BE issues), hotel search/list, room type + availability
   screen, booking + payment flow, "my bookings" screen.
