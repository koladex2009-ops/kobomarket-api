# KoboMarket API

Multi-vendor marketplace backend with escrow wallets and a double-entry ledger.
Stack: Node.js, Express, MongoDB, PostgreSQL (Knex migrations).

## Setup
1. `cp .env.example .env` and fill in the values
2. `docker compose up -d postgres mongo`
3. `npm install`
4. `npm run migrate`
5. `npm run dev`

Health check: `GET http://localhost:3000/health`

## Implemented so far
- Auth: register, email verification, login (access and refresh tokens)
- PostgreSQL double-entry ledger schema with constraints and an append-only trigger
- Ledger transfer service with row locking
- Wallet creation on register, with a compensating action if it fails

## Not yet implemented
Products, cart, orders and escrow, funding webhook, disputes, payouts, notifications, admin reports, tests.

## Cross-database consistency
Registration creates a Mongo user, then a Postgres wallet. If the wallet step fails, the Mongo user is deleted (compensating action).