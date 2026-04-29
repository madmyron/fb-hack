# Tech & Creation Conventions

## Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Hosting:** Vercel (frontend), Vercel serverless or Railway (backend)
- **Repo:** GitHub, one repo per project with `/client` and `/server` folders
- **Database:** Supabase (Postgres) unless otherwise decided
- **Real-time:** Socket.io for live updates

## Repo Structure
```
project-root/
  client/         # React frontend
  server/         # Node/Express backend
  conventions-tech.md
  conventions-communication.md
  README.md
```

## File Size
- Target: 150–300 lines per file
- Hard limit: 400 lines — split into logical segments if exceeded
- Split by feature or responsibility (e.g., `routes/orders.js`, `components/Menu/MenuItem.jsx`)

## Naming
- Components: PascalCase (`OrderCard.jsx`)
- Files/folders: kebab-case (`order-card.jsx`) except React components
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Component Structure
- One component per file
- Keep components focused — if it does more than one thing, split it
- Put shared UI in `/components`, page-level views in `/pages`

## API Routes
- RESTful: `GET /api/orders`, `POST /api/orders`, etc.
- All routes under `/api/` prefix
- Group by resource: `routes/orders.js`, `routes/menu.js`, `routes/servers.js`

## Environment Variables
- Never hardcode secrets
- Use `.env` files, add to `.gitignore`
- Document required vars in `README.md`

## No Comments Rule
- Don't add comments explaining what code does
- Only comment when something would genuinely confuse a future reader (a workaround, a hidden constraint)

## Payments
- Stripe for online payments
- Split bill and multiple payment methods supported
- POS API integration planned for later — use dummy data and a "Pay Now" button for now

## POS Integration
- Future: integrate with top POS systems (Toast, Square, Clover, etc.)
- Plan: build a single internal API that adapts to each POS
- For now: dummy menu data, no POS connection

## Deployment
- Frontend deploys to Vercel automatically on push to `main`
- Backend deploys separately (Vercel serverless functions or Railway)
- Always test on preview URL before promoting to production

## Updates
- This file is a living document — update it as new decisions are made
- Last updated: 2026-04-29
