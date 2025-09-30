# Black Fortress — Secure Login System with RBAC

Live on : https://black-fortress-frex.onrender.com

Modern, production‑ready authentication and role‑based access control built with Node.js, Express, JWT (HttpOnly cookies), MongoDB (Mongoose), and reCAPTCHA v3. Includes admin dashboard, account lockout, input validation, rate limiting, and hardened CSP.

## Features

- User registration and login with bcrypt password hashing
- JWT session in HttpOnly cookie; logout endpoint clears cookie
- Role‑based access control: `admin` and `user`
- Admin dashboard: list users, change roles
- Security: Helmet CSP, CORS, rate limiting, account lockout after failed attempts
- Input validation with `express-validator`
- reCAPTCHA v3 (optional; invisible) integrated end‑to‑end

## Tech Stack

- Node.js + Express
- MongoDB Atlas (via Mongoose)
- JWT (jsonwebtoken)
- bcrypt
- Helmet, express‑rate‑limit, express‑validator, cookie‑parser, CORS
- Vanilla HTML/CSS/JS frontend in `public/`

## Directory Structure

```
src/
  server.js            # Express app, security middleware, static hosting, routes
  middleware/auth.js   # requireAuth, requireRole
  models/User.js       # Mongoose User model
  routes/
    auth.js            # /api/auth/register, /login, /logout
    admin.js           # /api/admin/* (admin‑only)
    me.js              # /api/me/profile
public/
  index.html           # Public landing page
  login.html|.js       # Login UI + client validation
  register.html|.js    # Registration UI + strength meter
  admin.html|.js       # Admin dashboard (users table, role changes)
  user.html|.js        # User dashboard
  captcha.js           # Loads reCAPTCHA v3 and manages tokens
  styles.css           # Design system
```

## Environment Variables

Create a `.env` file (not committed). Example:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_in_production
MONGO_URI=mongodb://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority
RECAPTCHA_SITE_KEY=   # optional; set when enabling reCAPTCHA v3
RECAPTCHA_SECRET=     # optional; backend secret; leave blank to disable locally
```

An `.env.example` is provided as a reference.

## Local Setup

1. Install deps

```
npm install
```

2. Configure `.env` (see above). For local only, you may leave `RECAPTCHA_*` empty to disable verification.
3. Run the server

```
npm run dev
```

4. Visit `http://localhost:3000`

## MongoDB Atlas (Free Tier) Quickstart

1. Create a free M0 cluster at Atlas
2. Create a DB user (username/password)
3. Network access: allow your IP (and/or 0.0.0.0/0 temporarily)
4. Get the connection string and set `MONGO_URI` in `.env`

## reCAPTCHA v3 Setup (Optional but recommended)

1. In the reCAPTCHA admin, create a v3 key
2. Add domains:
   - Local: `localhost`, `127.0.0.1`, `::1`
   - Production: your Render domain, e.g. `your-app.onrender.com`
3. Set on the server (Render or local):
   - `RECAPTCHA_SITE_KEY` (frontend) and `RECAPTCHA_SECRET` (backend)
4. Server exposes `GET /api/config/public` returning the site key; `public/captcha.js` loads Google script and keeps `window.captchaToken` fresh

Note: reCAPTCHA v3 is invisible; there is no checkbox. If you need a visible challenge, use v2 Invisible/Checkbox and adapt the frontend.

## Deployment (Render.com)

1. Push repo to GitHub
2. Create Web Service on Render from this repo
3. Build Command:

```
npm install
```

4. Start Command:

```
node src/server.js
```

5. Environment variables on Render:

```
NODE_ENV=production
JWT_SECRET=your-strong-secret
MONGO_URI=your-atlas-uri
RECAPTCHA_SITE_KEY=your-v3-site-key   # optional
RECAPTCHA_SECRET=your-v3-secret       # optional
```

6. Open the Render URL and test

## Testing Plan (Manual)

- Registration
  - Valid: new email, strong password → 201
  - Duplicate email → 409
  - Invalid email/password → 400
- Login
  - Valid credentials → 200, redirected to dashboard
  - Invalid credentials → 401; lockout after several failures → 423
- RBAC
  - Non‑admin cannot access `/api/admin/*` or `admin.html`
  - Admin can list users and change roles
- Sessions
  - Cookie present after login; cleared after logout
- reCAPTCHA
  - With keys set: backend accepts valid token; without/invalid → 400

## Troubleshooting

- reCAPTCHA returns 400
  - Ensure you’re using a v3 key and domains include your host
  - Verify `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET` are set correctly
  - Hard refresh to reload Google scripts
- CSP blocks
  - We allow `google.com`, `gstatic.com`, and `recaptcha.net` for script/frame/connect
- Rate limiter IPv6 warning
  - Resolved by using default IPv6‑safe key generator
- Cookie not clearing on logout
  - We clear using same attributes (httpOnly/secure/sameSite) as set on login

## Challenges & Solutions

- CSP vs inline scripts: moved inline JS to external files and configured Helmet CSP for Google reCAPTCHA.
- reCAPTCHA v3 domain/key issues: added a config endpoint and robust token refresh to avoid race conditions; documented domain setup and env vars.
- Rate limiter IPv6 warning: switched to IPv6‑safe default key generator.
- Cookie clearing in production: matched cookie attributes on clear to ensure logout reliability.

## License

ISC (see package.json)

