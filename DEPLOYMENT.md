# Deployment checklist

Use this when deploying the full stack (attestation contract, backend, frontend).

---

## Mainnet deployment (summary)

For **production (mainnet)**:

1. **Database** – Apply migrations on your production Supabase (e.g. `npx supabase db push` or run migration SQL in dashboard).
2. **NEAR contracts** – Deploy with `NEAR_ENV=mainnet` and **mainnet** accounts (see [§1](#1-payroll-attestation-contract-near) and [contracts/payroll-attestation/DEPLOY_NEAR.md](contracts/payroll-attestation/DEPLOY_NEAR.md)).
3. **Backend env** – Set **mainnet** values:
   - `NEAR_NETWORK_ID=mainnet`
   - `NEAR_ATTESTATION_CONTRACT_ID`, `NEAR_ATTESTATION_NEAR_ACCOUNT_ID`, `NEAR_ATTESTATION_NEAR_PRIVATE_KEY` (for claim attestation).
   - `PAYROLL_RECEIPT_LOGGER_CONTRACT_ID`, `PAYROLL_RECEIPT_LOGGER_NEAR_ACCOUNT_ID`, `PAYROLL_RECEIPT_LOGGER_NEAR_PRIVATE_KEY` (for deal payment receipts; same network as payments).
   - Production Supabase, Privy, 1-Click/NEAR Intents API, and any other service keys.
4. **Frontend** – Build and deploy; set `NEXT_PUBLIC_BACKEND_URL` (and other public env) to your production backend URL.
5. **Verify** – Run a small test payment on mainnet and confirm attestation/receipt and explorer links.

If you were on testnet before, switch every NEAR-related env to mainnet IDs and `NEAR_NETWORK_ID=mainnet` so attestation and receipt logging run on the same network as real payments.

---

## 1. Payroll attestation contract (NEAR)

The contract now uses **commitment-only** storage (no plaintext amount/token/recipient on-chain). You must deploy the **new** WASM.

### First-time deploy (new account)

```bash
cd contracts/payroll-attestation

# Build (Rust 1.86 via rust-toolchain.toml; select non-reproducible-wasm when prompted)
cargo near build

# Create account (testnet example)
NEAR_ENV=testnet near create-account payroll-attestation.<your>.testnet --masterAccount <your>.testnet --initialBalance 2

# Deploy + init
NEAR_ENV=testnet CONTRACT_ACCOUNT=payroll-attestation.<your>.testnet INIT_CALLER=<your>.testnet bash deploy.sh deploy-only
```

### Update existing contract (same account, new WASM)

If the account is **already initialized**, only update the code (do not call `new` again):

```bash
cd contracts/payroll-attestation

cargo near build
NEAR_ENV=testnet CONTRACT_ACCOUNT=payroll-attestation.lisabey.testnet bash deploy.sh update
```

**Mainnet (production):**

```bash
cd contracts/payroll-attestation
cargo near build
# Create mainnet account if needed: NEAR_ENV=mainnet near create-account payroll-attestation.yourname.near --masterAccount yourname.near --initialBalance 2
NEAR_ENV=mainnet CONTRACT_ACCOUNT=payroll-attestation.yourname.near INIT_CALLER=your-backend.near bash deploy.sh deploy-only
# Or if contract already exists: NEAR_ENV=mainnet CONTRACT_ACCOUNT=payroll-attestation.yourname.near bash deploy.sh update
```

Then in backend env set `NEAR_NETWORK_ID=mainnet`, `NEAR_ATTESTATION_CONTRACT_ID=payroll-attestation.yourname.near`, `NEAR_ATTESTATION_NEAR_ACCOUNT_ID=your-backend.near`, and `NEAR_ATTESTATION_NEAR_PRIVATE_KEY=ed25519:...` (from the account that will call the contract).

---

## 2. Backend

### Database migration

Run the migration that adds `attestation_nonce` to `claims` (needed for commitment verification):

```bash
cd apps/backend
# If using Supabase CLI linked to your project:
npx supabase db push

# Or apply the migration file manually in Supabase dashboard (SQL editor):
# apps/backend/supabase/migrations/20260223000000_add_attestation_nonce_to_claims.sql
```

### Environment

In `apps/backend/.env` or `.env.local`, set:

```env
NEAR_ATTESTATION_CONTRACT_ID=payroll-attestation.<your>.testnet
NEAR_ATTESTATION_NEAR_ACCOUNT_ID=<caller-account-id>
NEAR_ATTESTATION_NEAR_PRIVATE_KEY=ed25519:...
NEAR_NETWORK_ID=testnet
```

Use the **same** account for `NEAR_ATTESTATION_NEAR_ACCOUNT_ID` as `INIT_CALLER` (or the account you allowed in the contract). The private key is from `~/.near-credentials/<network>/<account>.json` or your key storage.

Optional: `NEAR_RPC_URL` if you want to override the default FastNear RPC.

### Run

```bash
npm run dev:backend
# or production
npm run build:backend && node apps/backend/dist/main.js
```

---

## 3. Frontend

No extra env is required for attestation (claim and invoice pages read from the API).

```bash
npm run build
# Deploy the output (e.g. apps/frontend/.next or your host’s build command)
```

If you use Vercel / Netlify / etc., point the project to the repo and set `NEXT_PUBLIC_BACKEND_URL` (and any other existing frontend env) in the host’s dashboard.

### Preview / branch deployments (Vercel)

To make a **frontend** branch (e.g. `feature/near-payroll`) use a **backend** deployment from the same branch:

1. Deploy the backend from that branch (same Vercel project for backend, or Railway/Render/Fly preview) and copy its URL.
2. In the **frontend** Vercel project: **Settings → Environment Variables**.
3. Set `NEXT_PUBLIC_BACKEND_URL` with:
   - **Environment:** **Preview** (not only Production — preview builds need this)
   - **Branch:** e.g. `feature/near-payroll` (optional; so only that branch’s previews use this backend)
   - **Value:** the backend preview URL from step 1 (e.g. `https://your-backend.up.railway.app`).
4. Set `NEXT_PUBLIC_PRIVY_APP_ID` for **Preview** as well (same value as production if you use one Privy app).
5. **Redeploy** the frontend (Deployments → … → Redeploy, or push a new commit). Next.js inlines `NEXT_PUBLIC_*` at **build time**, so existing previews won’t see new env until you redeploy. If it still shows localhost, use **Redeploy without cache**.

**If you see “[API] NEXT_PUBLIC_BACKEND_URL not set” on preview:** the variable was missing when that build ran. Add it for the **Preview** environment (not only Production), then redeploy (without cache if needed).

**If Privy login fails on preview:** allow the preview domain in the [Privy dashboard](https://dashboard.privy.io): open your app → **Settings** → **Allowed origins** (or **Allowed domains**) and add your preview URL, e.g. `https://your-project-*.vercel.app` or the exact preview URL (e.g. `https://loofta-swap-git-feature-xxx-team.vercel.app`). Without this, Privy blocks the login for that origin.

---

## Quick reference

| Step        | Command / action |
|------------|-------------------|
| Contract   | `cd contracts/payroll-attestation && cargo near build && bash deploy.sh update` (or `deploy-only` for first deploy + init). **Mainnet:** `NEAR_ENV=mainnet` and mainnet accounts. |
| DB         | Apply `20260223000000_add_attestation_nonce_to_claims.sql` (Supabase push or SQL editor) |
| Backend env| `NEAR_NETWORK_ID=mainnet` (production). Claim attestation: `NEAR_ATTESTATION_*`. Deal payment receipts: `PAYROLL_RECEIPT_LOGGER_*` (see env.template). |
| Frontend   | `npm run build` and deploy; set `NEXT_PUBLIC_BACKEND_URL` to production backend. |
