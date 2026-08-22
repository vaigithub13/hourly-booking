# Share with Flutter (free hosted API)

Fill the **Live URLs** section after you finish [DEPLOY.md](./DEPLOY.md), then send this file to the Flutter developer.

## Live URLs (fill these in)

| What | URL |
|---|---|
| API base | `https://________________.onrender.com` |
| REST prefix | `https://________________.onrender.com/v1` |
| Swagger (try endpoints) | `https://________________.onrender.com/docs` |
| Admin panel | `https://________________.onrender.com` |
| GitHub | https://github.com/vaigithub13/hourly-booking |

Health check: `GET /` → `{ "message": "App is running successfully!" }`

**Cold start:** the free API sleeps after ~15 minutes idle. The first request can take 30–60 seconds. Retry once if you get a timeout.

---

## Auth (required for bookings)

Header on authenticated calls:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
x-lang: en
```

Phone numbers must match `+974` + 8 digits (example: `+97450000000`).

### Demo guest (already seeded)

1. `POST /v1/users/confirm-otp`

```json
{ "emailOrPhoneNumber": "+97450000000", "otpCode": "3489" }
```

2. Save `accessToken` and `refreshToken` from the response.

`3489` is a **demo OTP bypass** (`ENABLE_OTP_BYPASS=true`). Real SMS/email is not configured on the free deploy.

### New guest

1. `POST /v1/users/sign-up`

```json
{
  "firstName": "Ali",
  "lastName": "Guest",
  "phoneNumber": "+97451111111"
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

### List hotels response (shape)

```json
{
  "count": 1,
  "rows": [
    {
      "id": 1,
      "name": "Hourly Stay Doha",
      "city": "Doha",
      "latitude": "25.326",
      "longitude": "51.531",
      "minBookingHours": 3,
      "openTime": "08:00",
      "closeTime": "23:00",
      "amenities": ["wifi", "parking", "ac", "pool"],
      "roomTypes": [
        {
          "id": 1,
          "name": "Deluxe King",
          "maxOccupancy": 2,
          "basePriceForMinHours": 150,
          "pricePerAdditionalHour": 35
        }
      ]
    }
  ]
}
```

### Create booking

`POST /v1/bookings`

```json
{
  "roomTypeId": 1,
  "checkIn": "2026-08-23T14:00:00.000Z",
  "checkOut": "2026-08-23T17:00:00.000Z",
  "guestCount": 2,
  "guestPhone": "+97450000000"
}
```

Pricing: `basePriceForMinHours` + extra hours × `pricePerAdditionalHour`. Extra hours are `ceil(duration − hotel.minBookingHours)`.

Statuses: `pending_payment` → `confirmed` → `checked_in` → `completed` (also `cancelled`, `no_show`). Payment confirm is **not wired yet** — treat `pending_payment` as a successful hold of the slot for now.

ISO datetimes required (`2026-08-23T14:00:00.000Z`). Overlap is per physical room.

---

## Sample data on first boot

| Entity | Value |
|---|---|
| Hotel | Hourly Stay Doha (city `Doha`, approved) |
| Room types | Deluxe King (`150` + `35`/extra hour), Standard Twin (`110` + `25`) |
| Rooms | 101, 102, 201, 202 |
| Demo user | `+97450000000` / OTP `3489` |
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
