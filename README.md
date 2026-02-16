# Loofta Pay — Payroll

**Multi-chain payroll and contributor payments, gas abstracted via NEAR Intents.**

Loofta Payroll lets you create organizations, invite contributors, set up deals, and pay in crypto across chains. Pay out in the token and network you choose; NEAR Intents handles routing. Optional on-chain attestation records completed payments on NEAR for audit.

## Features

- **Organizations** — Create orgs, add contributors (team or contractors), manage roles (owner, admin, contributor).
- **Deals** — Create deals, invite contributors by email, set amounts and tokens; contributors accept and confirm delivery; you release payment.
- **Invoices** — Generate invoices from deals; pay in one go. Gas abstracted via NEAR Intents.
- **Pay flow** — Pay contributors in 20+ chains/tokens; same-chain or cross-chain routing (Biconomy, Rhinestone, NEAR Intents).
- **NEAR attestation** — Optional on-chain proof per completed payment (claim id, amount, token, execution ref) for hackathon/audit.
- **Email login** — Privy (email-only) for embedded wallet and auth; no separate wallet required for basic use.

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind, [Privy](https://privy.io/)
- **Backend**: NestJS, Supabase (Postgres)
- **Payments**: [NEAR Intents](https://near.org/), [Biconomy](https://biconomy.io/), [Rhinestone](https://rhinestone.dev/)

## Project structure

Monorepo (npm workspaces):

```
apps/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── payroll/           # Payroll app
│       │   │   ├── [orgId]/        # Org: team, deals, pay, invoices, history
│       │   │   ├── invite/[token]/ # Contributor invite onboarding
│       │   │   └── my-invoices/
│       │   └── api/                # Payroll API routes (quote, etc.)
│       ├── components/             # NewDealModal, DealContributorView, …
│       └── services/api/           # payroll, deals
└── backend/
    └── src/
        ├── modules/                # payroll, users, deals, …
        └── supabase/migrations/
contracts/
└── payroll-attestation/            # NEAR contract (Rust) for payment proof
```

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)

### Installation

```bash
git clone https://github.com/lisabeyy/loofta-swap.git
cd loofta-swap
npm install
npm run dev
```

Open [http://localhost:3000/payroll](http://localhost:3000/payroll). For full flow (APIs, DB), run the backend:

```bash
npm run dev:backend
```

### Environment variables

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
# Optional: NEXT_PUBLIC_HELIUS_API_KEY or NEXT_PUBLIC_SOLANA_RPC_URL
# NEAR Intents / 1-Click: NEXT_PUBLIC_ONECLICK_JWT, etc. (see apps/frontend/env.example)
```

**Backend** (`apps/backend/.env.local`):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET=your_supabase_service_role_key
# NEAR attestation: NEAR_ATTESTATION_CONTRACT_ID, NEAR_ATTESTATION_NEAR_ACCOUNT_ID, NEAR_ATTESTATION_NEAR_PRIVATE_KEY, NEAR_NETWORK_ID
# See apps/backend/env.template for full list
```

See `apps/backend/supabase/REMOTE_DEV.md` for using a remote Supabase project.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run dev:backend` | Start backend |
| `npm run build` | Build frontend |
| `npm run start` | Start frontend (production) |
| `npm run lint` | Lint all workspaces |
| `npm run db:migrate:local` | Reset local DB and apply migrations |
| `npm run db:migrate:prod` | Push migrations to linked remote Supabase |

**NEAR payroll attestation contract:**

```bash
cd contracts/payroll-attestation
./deploy.sh                    # build only
CONTRACT_ACCOUNT=payroll-attestation.yourname.near INIT_CALLER=your-backend.near ./deploy.sh deploy-only
```

## Deployment

| App      | Platform | Notes |
|----------|----------|--------|
| Backend  | Railway  | `.github/workflows/deploy-backend.yml` on push to `main` when `apps/backend/**` changes. Set **`RAILWAY_TOKEN`** (optional **`RAILWAY_SERVICE_ID`**). |
| Frontend | Vercel  | Auto-deploys on push to `main`. Set **Preview** env vars for branch deploys: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_PRIVY_APP_ID`. |
| DB       | GitHub Actions | Migrations when `apps/backend/supabase/migrations/**` change on `main`. |

See [DEPLOYMENT.md](DEPLOYMENT.md) for full checklist (contract, backend env, frontend env, Privy allowed origins).

## NEAR attestation (on-chain payment proof)

Optional: completed deal payments can be recorded on NEAR (one record per payment: claim id, amount, token, execution ref).

- **Contract**: `contracts/payroll-attestation` (Rust; `record_payment` / `get_payment`).
- **Backend env**: `NEAR_ATTESTATION_CONTRACT_ID`, `NEAR_ATTESTATION_NEAR_ACCOUNT_ID`, `NEAR_ATTESTATION_NEAR_PRIVATE_KEY`, `NEAR_NETWORK_ID=mainnet`. When set, the backend calls the contract after each successful payment and stores the NEAR tx hash; the UI can show “Attested on NEAR” with a link.

## Links

- **Payroll**: [pay.loofta.xyz](https://pay.loofta.xyz)
- **Twitter**: [@looftapay](https://x.com/looftapay)
- **Telegram**: [t.me/looftaxyz](https://t.me/looftaxyz)

## License

Private — All rights reserved.
