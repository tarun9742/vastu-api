# Vastu API (Node.js & Express)

Backend service for **Bhuwneshwari Scientific Vastu**, powered by Node.js, Express, and MongoDB/Mongoose.

## Architecture
- **Controllers** (`src/controllers/`): Business logic for auth, products, consultations/appointments, orders, customers, blog, training, settings, uploads, and health.
- **Routes** (`src/routes/`): Modular Express route definitions cleanly mounted on `/api`.
- **Models** (`src/models/`): Mongoose schemas for MongoDB collections.
- **Middlewares** (`src/middlewares/` / `src/lib/auth.js`): Admin session verification (`requireAdmin`), cookie handling, and CORS.

## Requirements
- Node.js 20+
- MongoDB local instance or Atlas

## Getting Started
1. Configure `.env` (check `MONGODB_URI`, `PORT=3001`, `CORS_ORIGIN=http://localhost:3000`, `ADMIN_MOBILE`, `AUTH_SECRET`).
2. Run `npm install`.
3. Seed data if needed:
   - `npm run seed:products`
   - `npm run seed:demo`
   - `npm run seed:content`
4. Start development server:
   ```bash
   npm run dev
   ```
   (Uses Node native `--watch` to auto-reload on file changes).

## Preserved Endpoints
### Health
- `GET /api/health` — Service readiness & DB connection check

### Products
- `GET /api/products` — Published products with search (`q`), filter (`category`), and pagination (`page`, `limit`)
- `GET /api/products/:slug` — Single published product details

### Consultations & Appointments
- `POST /api/appointment` — Book vastu consultation (saves to database with booking reference)

### Content & Store Settings
- `GET /api/settings` — Public store, maintenance, and SEO settings
- `GET /api/blog` — Public published posts (or `?slug=...`)
- `GET /api/training` — Public published training courses

### Authentication & Authorization
- `POST /api/auth/otp/send` — Send OTP to 10-digit mobile number
- `POST /api/auth/otp/verify` — Verify OTP; if phone matches `ADMIN_MOBILE`, grants `role: "admin"` and redirects to `/admin`
- `GET /api/auth/me` — Read session from `vastu_session` cookie
- `POST /api/auth/logout` — Clear session cookie
- `POST /api/auth/admin-login` — Password-based admin login
- `POST /api/auth/bootstrap-admin` — Bootstrap first admin with `x-bootstrap-key`

### Admin Management (Guarded by `requireAdmin` session)
- `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`
- `GET/POST /api/admin/consultations`, `PATCH/DELETE /api/admin/consultations/:id`
- `GET /api/admin/orders`, `GET/PATCH /api/admin/orders/:id`
- `GET /api/admin/customers`
- `GET/PUT /api/admin/settings`
- `GET/POST /api/admin/blog`, `PATCH/DELETE /api/admin/blog/:id`
- `GET/POST /api/admin/training`, `PATCH/DELETE /api/admin/training/:id`
- `POST /api/uploads/sign` — Cloudinary signature generator
