# Deploy API + Admin for free (Render + Neon)

You cannot host Postgres + a Node API + a React admin on one “magic” free URL without accounts. This path is free (no card for Render/Neon at the time of writing):

1. **Neon** — Postgres that does not expire after 30 days  
   https://console.neon.tech
2. **Render** — API (Docker web service) + admin (static site)  
   https://dashboard.render.com  
   Sign up with GitHub.
3. This GitHub repo: https://github.com/vaigithub13/hourly-booking

Render free web services **sleep after 15 minutes**. First hit can take ~1 minute. Neon free has a compute size limit; use the **direct** connection string (host without `-pooler`) so Sequelize transactions work.

---

## 1. Push this branch to GitHub

From the project root (after the deploy-related commits are on `main`):

```bash
git push origin main
```

---

## 2. Create the database (Neon)

1. Open https://console.neon.tech → New project → name `hourly-booking`, region close to Render (e.g. **Oregon** / `us-west`).
2. Open the project → **Connection details**.
3. Choose **direct** connection (not pooled / not `…-pooler…`).
4. Copy the URI. It looks like:

```
postgresql://USER:PASSWORD@ep-xxxxx.us-west-2.aws.neon.tech/neondb?sslmode=require
```

If the URI contains `channel_binding=require`, you can leave it; if Sequelize fails to connect, remove that query param.

---

## 3. Deploy the API (Render)

1. https://dashboard.render.com/select-repo?type=web  
2. Connect `vaigithub13/hourly-booking`.
3. Settings:

| Field | Value |
|---|---|
| Name | `hourly-booking-api` |
| Region | same as Neon if possible |
| Runtime | **Docker** |
| Dockerfile path | `Dockerfile` (repo root) |
| Docker build context directory | `.` or leave **empty** (must be the **repository root**, not `BE`) |
| Instance type | **Free** |
| Health check path | `/` |

4. Environment variables (Environment tab → add):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon **direct** URI from step 2 |
| `API_HOST` | `https://hourly-booking-api.onrender.com` (use the real hostname Render shows after first save; you can update this once) |
| `FE_HOST` | admin URL, fill after step 4, e.g. `https://hourly-booking-admin.onrender.com` |
| `ADMIN_EMAIL` | e.g. `admin@hourly.local` |
| `ADMIN_PASSWORD` | a password you will share only with yourself |
| `JWT_SECRET` | long random string |
| `ENCRYPTION_KEY` | **exactly 32 characters**, e.g. `12345678901234567890123456789012` |
| `ENABLE_SEED` | `true` |
| `ENABLE_DEMO_SEED` | `true` |
| `ENABLE_SWAGGER` | `true` |
| `ENABLE_OTP_BYPASS` | `true` |
| `JWT_EXPIRE` | `7d` |
| `REFRESH_TOKEN_EXPIRE` | `30d` |

Leave AWS / Twilio / SendGrid / SkipCash empty — they have defaults now.

5. Create Web Service and wait for the first deploy (can take several minutes; first boot **alters all tables**).
6. Open `https://<your-service>.onrender.com/` — you should see the health JSON.
7. Open `https://<your-service>.onrender.com/docs` — Swagger.
8. Open `https://<your-service>.onrender.com/v1/hotels` — should list **Hourly Stay Doha**.

Copy the public API URL into `SHARE.md`.

---

## 4. Deploy the admin (Render Static Site)

Admin is a Create React App. The API URL is baked in at **build** time.

1. https://dashboard.render.com/select-repo?type=static  
2. Same repo.

| Field | Value |
|---|---|
| Name | `hourly-booking-admin` |
| Build command | `cd ADMIN && yarn install && CI=false yarn build` |
| Publish directory | `ADMIN/build` |

3. Environment variable:

| Key | Value |
|---|---|
| `REACT_APP_BASE_URL` | `https://hourly-booking-api.onrender.com/v1` (your real API + `/v1`) |

4. Deploy. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.  
   The UI is still the old shop dashboard; Flutter should use the **API**, not this panel.

---

## 5. Send it to your friend

1. Paste the three URLs into `SHARE.md` (API, `/docs`, admin).
2. Send them `SHARE.md` (or this GitHub file once pushed).
3. Tell them: first request after idle may be slow; demo OTP is `3489`; demo phone is `+919876543210`.

---

## Optional: Vercel for admin only

If you prefer Vercel for the React app: https://vercel.com/new  
Root directory `ADMIN`, env `REACT_APP_BASE_URL=https://YOUR-API.onrender.com/v1`.

---

## If deploy fails

- **Env validation / ENCRYPTION_KEY** — must be length 32.
- **SSL / DATABASE_URL** — use Neon direct host, `sslmode=require`.
- **Out of memory** — first `sequelize.sync({ alter: true })` is heavy on Render free (512 MB). Retry the deploy once; if it keeps dying, temporarily comment out unused models is a last resort.
- **Swagger 404** — `ENABLE_SWAGGER=true`.
- **Empty hotels** — `ENABLE_DEMO_SEED=true` and wait for logs `Demo hotel seeding completed`.
- **Yarn frozen lockfile in Docker** — keep `BE/yarn.lock` in git.
