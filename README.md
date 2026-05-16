# API Gateway

A NestJS API gateway that proxies HTTP requests to upstream microservices with JWT authentication, rate limiting, request logging, and a React admin panel.

---

## Quick Start

```bash
git clone https://github.com/viiktoria7kk/api-gateway.git
cd api-gateway
docker compose up
```

Open the admin panel: [http://localhost:3000/admin-ui](http://localhost:3000/admin-ui)

---

## Admin Panel

| URL | `http://localhost:3000/admin-ui` |
|-----|----------------------------------|
| Default token | `admin-secret` |

The panel shows live route configuration and a request log with auto-refresh every 5 seconds.

---

## Testing the Proxy

```bash
# Public route — no auth needed
curl http://localhost:3000/api/products

# Generate a test JWT
node -e "console.log(require('jsonwebtoken').sign({sub:'1',name:'Alice'}, 'super-secret-key'))"

# Protected route — paste the token from above
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users
```

---

## Admin API

```bash
# List all routes
curl -H "Authorization: Bearer admin-secret" http://localhost:3000/admin/routes

# Update a route (toggle auth or change rate limit)
curl -X PATCH \
  -H "Authorization: Bearer admin-secret" \
  -H "Content-Type: application/json" \
  -d '{"authRequired": false, "rateLimit": 10}' \
  http://localhost:3000/admin/routes/user-service

# View request logs
curl -H "Authorization: Bearer admin-secret" http://localhost:3000/admin/logs
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `dev-secret` | Secret used to verify JWT tokens |
| `ADMIN_TOKEN` | `admin-secret` | Bearer token for the admin API and panel |
| `PORT` | `3000` | Port the gateway listens on |

---

## Deploy to Render.com

1. Push this repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New → Web Service**.
3. Connect your GitHub repo.
4. Set **Environment** to `Docker` and leave the root directory as `/`.
5. Add environment variables in the Render dashboard:
   - `JWT_SECRET` — choose a strong secret
   - `ADMIN_TOKEN` — choose a strong token
   - `PORT` — `3000`
6. Click **Deploy**. Render will build and start all services via `docker compose`.
