# Share with Flutter (live API)

Send this file to the Flutter developer.

## Live URLs

| What | URL |
|---|---|
| API base | https://hourly-booking-api.onrender.com |
| REST prefix | https://hourly-booking-api.onrender.com/v1 |
| Swagger | https://hourly-booking-api.onrender.com/docs |
| Health | https://hourly-booking-api.onrender.com/ |
| GitHub | https://github.com/vaigithub13/hourly-booking |

Admin panel is not deployed yet. Flutter should use **only the API**.

**Response envelope:** every JSON body looks like `{ "success": true, "data": ..., "statusCode": 200, "message": "..." }`. Read the payload from **`data`**, not the root.

**Cold start:** free Render sleeps after ~15 minutes idle. First request can take 30–60 seconds. Retry once on timeout.

---

## Auth (required for bookings)

Header on authenticated calls:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
x-lang: en
```

Phone numbers must match `+91` + 10 digits (example: `+919876543210`).

### Demo guest (already seeded)

1. `POST /v1/users/confirm-otp`

```json
{ "emailOrPhoneNumber": "+919876543210", "otpCode": "3489" }
```

2. Save `accessToken` and `refreshToken` from the response.

`3489` is a **demo OTP bypass** (`ENABLE_OTP_BYPASS=true`). Real SMS/email is not configured on the free deploy.

### New guest

1. `POST /v1/users/sign-up`

```json
{
  "firstName": "Ali",
  "lastName": "Guest",
  "phoneNumber": "+919811111111"
}
```

2. `POST /v1/users/confirm-otp` with the same phone and `"otpCode": "3489"`.

Refresh: `POST /v1/users/refresh-token` `{ "refreshToken": "..." }`.

---

## Endpoints the Flutter app needs

Base: `{API}/v1`

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/hotels` | no | List approved hotels. Query: `city`, `limit`, `offset` |
| GET | `/hotels/:hotelId` | no | Hotel + room types |
| GET | `/rooms/types?hotelId=1` | no | Room types + physical rooms |
| GET | `/bookings/availability?roomTypeId=1&checkIn=ISO&checkOut=ISO` | optional | Free rooms in that window |
| POST | `/bookings` | yes | Create booking (`pending_payment`) |
| GET | `/bookings/mine` | yes | Current user bookings |
| PUT | `/bookings/:bookingId/cancel` | yes | Cancel. Body: `{ "reason": "..." }` |

### List hotels (`GET /v1/hotels`)

Hotel list lives at `data.rows`. Demo hotel id is **1**. Room types: Deluxe King **id 1** (`150` + `35`/hour), Standard Twin **id 2** (`110` + `25`/hour).

### Create booking

`POST /v1/bookings`

```json
{
  "roomTypeId": 1,
  "checkIn": "2026-08-23T14:00:00.000Z",
  "checkOut": "2026-08-23T17:00:00.000Z",
  "guestCount": 2,
  "guestPhone": "+919876543210"
}
```

Pricing: `basePriceForMinHours` + extra hours × `pricePerAdditionalHour`. Extra hours are `ceil(duration − hotel.minBookingHours)`.

Statuses: `pending_payment` → `confirmed` → `checked_in` → `completed` (also `cancelled`, `no_show`). Payment confirm is **not wired yet** — treat `pending_payment` as a successful hold of the slot for now.

ISO datetimes required (`2026-08-23T14:00:00.000Z`). Overlap is per physical room.

---

## Sample data on first boot

| Entity | Value |
|---|---|
| Hotel | Hourly Stay Mumbai (city `Mumbai`, approved) — existing live DBs may still show the earlier Doha demo hotel |
| Room types | Deluxe King (`150` + `35`/extra hour), Standard Twin (`110` + `25`) |
| Rooms | 101, 102, 201, 202 |
| Demo user | `+919876543210` / OTP `3489` |
| Admin panel login | the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from deploy (not for the mobile app) |

---

## Suggested Flutter screens

1. Hotel list (`GET /hotels`)
2. Hotel detail + room types
3. Pick check-in / check-out → `GET /bookings/availability`
4. Sign up / OTP → save JWT
5. `POST /bookings`
6. My bookings (`GET /bookings/mine`)

Interactive docs: open **Swagger** at `/docs` and try Hotels / Rooms / Bookings.

---

## Admin panel (you, not Flutter)

Login at the admin URL with the seeded admin email/password. The current UI is still the old shop dashboard; hotels are created via API or the demo seed. Flutter should talk **only to the API**, not to the admin site.
