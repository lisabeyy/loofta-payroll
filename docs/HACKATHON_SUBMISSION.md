# NEAR Hackathon — Project Submission

## Project name
**Loofta Pay — Payroll with On-Chain Attestation**

---

## Tagline (short)
Payroll with NEAR Intents and a permanent on-chain receipt for every completed payment.

---

## Description (for submission form)

**What we built**

We built **payroll with on-chain attestation** for the NEAR ecosystem: deal-based contractor/freelancer payments using **NEAR Intents** for cross-chain stablecoin payouts, and a **NEAR contract** that records a receipt for every completed payment. Every payroll run gets verifiable, on-chain proof.

**How it works**

1. **Deal flow:** An organization creates a deal, invites a freelancer by email, and the freelancer accepts and sets their preferred network and token (e.g. USDC on Base or NEAR). When the freelancer marks delivery complete and the org accepts, the system creates an invoice and a pending payment.

2. **Pay with any chain:** The org goes to Pay → Deal payments, opens a payment, and chooses which token to pay with (e.g. USDC on Base). They click **Get deposit address**; our backend uses the **NEAR Intents 1-Click API** to return a deposit address. The org sends the required amount on that chain; NEAR Intents executes the cross-chain intent and delivers funds to the freelancer’s wallet on their chosen network.

3. **On-chain attestation:** When the intent completes, our backend marks the payment completed and calls our NEAR contract to **post an on-chain receipt** (`record_receipt`). Every completed deal payment is attested on NEAR — no optional toggle. The payment detail page shows “On-chain attestation (receipt)” with a link to the NEAR transaction.

**Why it matters for the hackathon**

- **Stablecoins + intents as infrastructure:** We use NEAR Intents to express the outcome (“pay X USDC to this recipient on this chain”) and let the protocol handle routing. Payers can use USDC/USDT from many chains; recipients get the token and chain they chose.

- **On-chain attestation:** Our contract (payroll-attestation / payroll-receipt-logger) stores a receipt per payment. That gives a clear “invoice paid” signal on-chain — the main deliverable for the oracles/attestation track.

- **Execution safety:** We use quote/intent deadlines and idempotent receipt recording with retries, so we don’t leave “paid but not attested” state. The UI exposes “Retry receipt” if posting failed.

- **Auditability:** Completion and receipt-posting are logged; the payment page shows the attestation tx so operators and payees can verify what happened and when.

**Tech**

- **Frontend:** Next.js, TypeScript, Tailwind. Pay flow: token selector → Get deposit address → deposit details + QR → status polling → completion + attestation section.
- **Backend:** NestJS, Supabase. Integrates NEAR Intents (1-Click) for deposit addresses and intent status; calls the NEAR attestation contract on payment completion.
- **NEAR:** Contract(s) for `record_receipt` (deal payments) and optional `record_payment` (claims). Deployed on NEAR mainnet; backend uses `near-api-js` to post receipts.

**Links**

- **Demo / app:** [your-demo-url]
- **Repo:** [your-repo-url]
- **NEAR contract:** payroll-attestation (Rust); receipt stored on mainnet.

---

## Short description (for character-limited fields, ~300 chars)

Payroll with on-chain attestation: deal-based contractor payments via NEAR Intents (cross-chain USDC/USDT). Org gets a deposit address, sends funds; intent executes and pays the freelancer. When complete, our backend posts an on-chain receipt to a NEAR contract — every payment gets verifiable attestation. Built for the stablecoins + intents track.

---

## One-liner (~100 chars)

Payroll + NEAR Intents + on-chain receipt per payment. Cross-chain stablecoin payouts with verifiable attestation on NEAR.

---

## Keywords / tags

NEAR, NEAR Intents, stablecoins, USDC, USDT, payroll, attestation, on-chain receipt, cross-chain payments, contractor payments, Rust, Next.js, NestJS
