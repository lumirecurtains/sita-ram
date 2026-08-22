#!/usr/bin/env node

/**
 * Sita Ram Operating System — Local Database Seeding CLI (M0.5)
 *
 * Usage:
 *   node ./tools/emulators/seed/seed-emulator.mjs          # Deterministic seed
 *   node ./tools/emulators/seed/seed-emulator.mjs --reset  # Purge and re-seed
 */

import { SEED_CONFIG, SEED_VERSION, validateSafetyGuard } from './config.mjs';
import { resetEmulators } from './reset.mjs';
import { seedEmulators } from './loader.mjs';

async function main() {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset');
  const isHelp = args.includes('--help') || args.includes('-h');

  if (isHelp) {
    console.log(`
Sita Ram OS — Local Database Seeder (${SEED_VERSION})

Usage:
  npm run seed             Seed local Firebase emulators
  npm run seed:reset       Purge existing emulator data and re-seed
  node ./tools/emulators/seed/seed-emulator.mjs [--reset]

Flags:
  --reset    Purges local Firestore documents and Auth accounts before seeding
  --help     Shows this help message
`);
    process.exit(0);
  }

  console.log(`================================================================`);
  console.log(`🌱 SITA RAM OS — LOCAL DATABASE SEEDER (${SEED_VERSION})`);
  console.log(`================================================================`);
  console.log(`Target Project:   ${SEED_CONFIG.projectId}`);
  console.log(`Firestore Host:   ${SEED_CONFIG.firestoreHost}`);
  console.log(`Auth Host:        ${SEED_CONFIG.authHost}`);
  console.log(`Reset Requested:  ${isReset ? 'YES' : 'NO'}`);
  console.log(`----------------------------------------------------------------`);

  // Step 1: Execute 6-Layer Fail-Closed Pre-Flight Safety Guard
  console.log(`[1/3] Executing 6-layer defense-in-depth safety guard...`);
  const safety = validateSafetyGuard(SEED_CONFIG);
  if (!safety.safe) {
    console.error(`\n❌ SEEDING HALTED: Fail-closed safety guard rejected execution:`);
    for (const reason of safety.reasons) {
      console.error(`   - ${reason}`);
    }
    process.exit(1);
  }
  console.log(`      ✅ Safety guard verified (100% loopback & demo isolation).`);

  // Step 2: Perform Reset if requested
  if (isReset) {
    console.log(`[2/3] Purging local emulator state (--reset)...`);
    try {
      const resetResult = await resetEmulators(SEED_CONFIG);
      console.log(
        `      ✅ Firestore reset: ${resetResult.firestoreReset ? 'SUCCESS' : 'SKIPPED'}`,
      );
      console.log(`      ✅ Auth reset:      ${resetResult.authReset ? 'SUCCESS' : 'SKIPPED'}`);
    } catch (err) {
      console.error(`\n❌ RESET FAILED: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(`[2/3] Skipping reset (upsert mode active)...`);
  }

  // Step 3: Seed Fixtures
  console.log(`[3/3] Loading deterministic synthetic fixtures into emulators...`);
  try {
    const counts = await seedEmulators(SEED_CONFIG);

    console.log(`\n================================================================`);
    console.log(`🎉 LOCAL DATABASE SEEDING COMPLETED SUCCESSFULLY`);
    console.log(`================================================================`);
    console.log(`  👤 Auth Users:          ${counts.users}`);
    console.log(`  🏢 Organizations:       ${counts.organizations}`);
    console.log(`  🏷️  Brands:              ${counts.brands}`);
    console.log(`  📍 Outlets:             ${counts.outlets}`);
    console.log(`  👥 Customer Profiles:   ${counts.customers}`);
    console.log(`  📂 Categories:          ${counts.categories}`);
    console.log(`  🍛 Menu Items:          ${counts.menuItems}`);
    console.log(`  📦 Orders:              ${counts.orders}`);
    console.log(`  🌾 Raw Ingredients:     ${counts.ingredients}`);
    console.log(`  📋 Inventory Movements: ${counts.inventoryMovements}`);
    console.log(`  🔒 Audit Logs:          ${counts.auditLogs}`);
    console.log(`================================================================\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ SEEDING FAILED: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Unhandled Seeder Error:`, err);
  process.exit(1);
});
