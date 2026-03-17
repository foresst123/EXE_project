# EXE Project

Full-stack e-commerce web application built from the local `AGENT.md` requirements.

## Stack

- Frontend: React, Vite, TailwindCSS, Axios, React Router
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt
- Payments: Stripe Checkout + webhook confirmation
- Dev tooling: Docker, ESLint, Prettier

## Project structure

```text
.
├── backend
├── database
└── frontend
```

## Quick start

### 1. Start PostgreSQL

You can use your local PostgreSQL instance or Docker:

```bash
docker compose up -d db
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Stripe setup in `backend/.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SERVER_URL=http://localhost:5050
CLIENT_URL=http://localhost:5173
```

### 3. Create schema and seed data

Using Docker (recommended, no local `psql` needed):

```bash
docker compose exec -T db psql -U postgres -f /database/schema.sql
docker compose exec -T db psql -U postgres -d artdict_db -f /database/seed.sql
```

Using local PostgreSQL:

```bash
psql -U postgres -f database/schema.sql
psql -U postgres -d artdict_db -f database/seed.sql
```

### 4. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Run the apps

Backend:

```bash
cd backend && npm run dev
```

Frontend:

```bash
cd frontend && npm run dev
```

### 6. Forward Stripe webhook locally

```bash
stripe listen --forward-to localhost:5050/api/orders/webhook
```

## Demo accounts

- Admin: `admin@example.com` / `Admin@123`
- User: `john@example.com` / `User@1234`

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/authors`
- `GET /api/authors/:slug`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/cart`
- `POST /api/cart/add`
- `DELETE /api/cart/remove`
- `POST /api/orders/checkout-session`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/webhook`
- `GET /api/users`
- `PATCH /api/users/:id/role`

## Notes

- Backend uses a clean-ish layered structure: `routes -> controllers -> services`.
- Pagination, category filtering, author filtering, author profile pages, sold-count display, Stripe card checkout, webhook-driven order payment confirmation, chatbot widget, and a sidebar-based admin dashboard are included.
- This repo is scaffolded manually, so run `npm install` before starting the project.
