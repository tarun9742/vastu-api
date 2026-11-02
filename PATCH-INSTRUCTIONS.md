# Vastu API patch — changed/new files only

## Product catalogue replacement
1. Back up MongoDB first.
2. Configure `MONGODB_URI` in the environment (do not put real `.env` credentials in this patch ZIP).
3. Run `CONFIRM_REPLACE_PRODUCTS=YES npm run seed:real-products` from the API project root.
4. This deliberately deletes and replaces **only documents in the Product collection**. It does not delete users, orders, settings, blog posts, consultations, or training data.
5. The seed contains 62 products from the provided WooCommerce CSV. Each product has its single supplied image repeated three times in `images`. Uncategorized products are assigned a category based on product name. Products whose original descriptions were obvious placeholder/lorem text receive neutral descriptions; prices are preserved from the CSV.

## Added API routes
- `GET/PUT /api/admin/settings` — admin-protected settings read/update
- `GET /api/settings` — public-safe store/maintenance/SEO settings
- `GET/POST /api/admin/blog`; `PATCH/DELETE /api/admin/blog/:id`
- `GET /api/blog` — public published posts; optional `?slug=...`
- `GET/POST /api/admin/training`; `PATCH/DELETE /api/admin/training/:id`
- `GET /api/training` — published training
- `GET /api/admin/orders`; `GET/PATCH /api/admin/orders/:id`
- `GET /api/admin/customers`
- `GET/POST /api/admin/consultations`; `PATCH/DELETE /api/admin/consultations/:id`

Existing API route files are not included in this patch and should not be overwritten. These routes are backend foundations; frontend components need to call them for data to appear in the existing UI. No UI files are included or changed.
