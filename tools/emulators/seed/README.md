# Sita Ram OS — Local Database Seeding Tooling (M0.5)

## Overview

This directory contains the deterministic synthetic database seeding tooling for the **Sita Ram Restaurant Operating System** local development and testing environment.

## Safety & Invariants

- **Local-Only**: Gated by a 6-layer defense-in-depth pre-flight safety guard verifying project ID starts with `demo-` (e.g. `demo-sitaram-local`) and all endpoints are local loopback (`127.0.0.1` / `localhost`).
- **Deterministic**: Uses fixed nominal IDs (`org_gangaram_01`, `user_org_owner_01`, `item_gulab_jamun_01`), static baseline epoch (`2026-08-20T10:00:00.000Z`), and fixed seed version `seed-v1.0.0`.
- **Purely Synthetic**: All mock fixtures are synthetic development data on the Sita Ram OS platform with zero lineage or relationship to archived legacy codebases.
- **Integer Minor Units**: All monetary values are strictly represented in integer paise (INR).

## Usage

```bash
# Seed local Firebase emulators
npm run seed

# Purge existing emulator data and re-seed from scratch
npm run seed:reset
```

## Structure

- `config.mjs`: Configuration and 6-layer fail-closed safety pre-flight validator.
- `reset.mjs`: Local emulator purge utility targeting emulator REST endpoints.
- `loader.mjs`: REST-based Firestore and Auth emulator loader.
- `seed-emulator.mjs`: CLI runner entry point.
- `fixtures/`:
  - `tenants.mjs`: Multi-tenant topology (Tenant A + Tenant B).
  - `users.mjs`: Canonical 10-role Auth identities and custom claims.
  - `customers.mjs`: Customer profiles and addresses.
  - `catalog.mjs`: Categories and Menu items with modifiers.
  - `orders.mjs`: 4 representative orders across canonical FSM states.
  - `inventory.mjs`: Raw ingredients and `MovementType.RECEIPT` opening ledgers.
  - `audit.mjs`: Append-only audit trail logs.
  - `index.mjs`: Aggregates fixtures and validates referential integrity.
