# Kids Events Cameroon

Young Foundations Cameroon operations app: camps, Creations, and Cub Corner. Built with Next.js 15 (App Router), Refine, Sequelize, and MySQL.

## Requirements

- Node.js 20 or newer
- MySQL 8
- Copy `.env.example` to `.env` and set `SESSION_SECRET`, database credentials, and `APP_URL` / `NEXT_PUBLIC_APP_URL`

## Local setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The Refine CLI does not treat `-p` as a port. Use `PORT=5000 npm run dev` (or `set PORT=5000` on Windows) when you need a specific port.

Seeded logins (password from `SEED_PASSWORD`, default `SeedPass123!`):

- `superadmin@seed.kidsevent.cm` — same dashboard access as admin
- `admin@seed.kidsevent.cm` — admin
- `staff@seed.kidsevent.cm` — staff
- `guest@seed.kidsevent.cm` — guest portal only

Public self-registration creates a **guest** account. When Mailgun is configured, the user must confirm email before signing in. Staff accounts are created by admins (or seed), not the public form.

## Production notes

- `npm run build` then `npm run start`. `next.config.mjs` uses `output: "standalone"`.
- Event images are stored under `data/uploads` next to the app (or `UPLOAD_DIR`). They are served by `/api/uploads/...`, not copied into `public/`.
- CamPay: set `CAMPAY_ENABLED`, credentials, and register the webhook `{APP_URL}/api/payments/campay/webhook`. DEV uses the test amount; PROD uses event fees.
- Mailgun: set `MAILGUN_API_KEY` and `MAILGUN_DOMAIN`. Invitation queue still works without mail; use **Send** on the event page once mail is configured.
- Do not commit `.env`.

## License

MIT
