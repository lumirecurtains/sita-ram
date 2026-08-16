#!/usr/bin/env node

/**
 * Sita Ram Operating System — Windows/Cross-Platform Emulator Port Pre-Flight Check
 *
 * Validates local port availability for Firebase Emulator Suite before startup.
 * Ports checked:
 * - 4000 (Emulator UI)
 * - 4400 (Emulator Hub)
 * - 8080 (Firestore Emulator)
 * - 9099 (Auth Emulator)
 * - 9199 (Storage Emulator)
 */

import net from 'node:net';

const PORTS = [
  { name: 'Emulator UI', port: 4000 },
  { name: 'Emulator Hub', port: 4400 },
  { name: 'Firestore Emulator', port: 8080 },
  { name: 'Auth Emulator', port: 9099 },
  { name: 'Storage Emulator', port: 9199 },
];

const checkPort = (port) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve({ port, available: false, error: 'EADDRINUSE' });
      } else {
        resolve({ port, available: false, error: err.code });
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve({ port, available: true });
      });
    });

    server.listen(port, '127.0.0.1');
  });

async function main() {
  console.log('================================================================');
  console.log('       SITA RAM — FIREBASE EMULATOR PORT PRE-FLIGHT CHECK       ');
  console.log('================================================================\n');

  let allAvailable = true;
  const occupied = [];

  for (const item of PORTS) {
    const result = await checkPort(item.port);
    if (result.available) {
      console.log(`  🟢 Port ${item.port.toString().padEnd(5)} [AVAILABLE] — ${item.name}`);
    } else {
      console.log(
        `  🔴 Port ${item.port.toString().padEnd(5)} [OCCUPIED]  — ${item.name} (${result.error})`,
      );
      allAvailable = false;
      occupied.push(item);
    }
  }

  console.log('\n----------------------------------------------------------------');

  if (!allAvailable) {
    console.error('\n❌ ERROR: Port collision detected.');
    console.error('The following ports are already in use:');
    for (const item of occupied) {
      console.error(`  - Port ${item.port} (${item.name})`);
    }
    console.error('\nOn Windows PowerShell, run:');
    console.error(
      '  Get-NetTCPConnection -LocalPort ' +
        occupied.map((o) => o.port).join(',') +
        ' | Select-Object LocalPort, OwningProcess\n',
    );
    process.exit(1);
  }

  console.log('✅ SUCCESS: All emulator ports are available for local development.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Unexpected error running port check:', err);
  process.exit(1);
});
