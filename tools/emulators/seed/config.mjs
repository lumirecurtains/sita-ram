/**
 * Sita Ram Operating System — Local Database Seeding Configuration & Fail-Closed Safety Guard (M0.5)
 *
 * Enforces strict 6-layer defense-in-depth isolation before any write operation is permitted.
 */

import net from 'node:net';

export const SEED_VERSION = 'seed-v1.0.0';
export const BASELINE_EPOCH = '2026-08-20T10:00:00.000Z';

export const SEED_CONFIG = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-sitaram-local',
  firestoreHost: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
  authHost: process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099',
  useEmulators: process.env.VITE_USE_EMULATORS || 'true',
};

/**
 * Validates whether the given host is a local loopback interface.
 * @param {string} hostAndPort
 * @returns {boolean}
 */
export function isLoopbackHost(hostAndPort) {
  if (!hostAndPort || typeof hostAndPort !== 'string') return false;
  const host = hostAndPort.replace(/:\d+$/, '').replace(/^\[/, '').replace(/\]$/, '').toLowerCase();
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

/**
 * 6-Layer Defense-in-Depth Fail-Closed Safety Validator.
 * Returns an object with `safe: boolean` and descriptive failure `reasons`.
 *
 * @param {typeof SEED_CONFIG} config
 * @returns {{ safe: boolean, reasons: string[] }}
 */
export function validateSafetyGuard(config = SEED_CONFIG) {
  const reasons = [];

  // Layer 1: Project ID Inspection (Must start with 'demo-')
  if (!config.projectId || !config.projectId.startsWith('demo-')) {
    reasons.push(
      `Layer 1 Violation: Project ID "${config.projectId}" is not an offline demo project (must begin with "demo-").`,
    );
  }

  // Layer 2: Firestore Host Loopback Verification
  if (!isLoopbackHost(config.firestoreHost)) {
    reasons.push(
      `Layer 2 Violation: Firestore host "${config.firestoreHost}" is not a local loopback address (must be 127.0.0.1 or localhost).`,
    );
  }

  // Layer 3: Auth Host Loopback Verification
  if (!isLoopbackHost(config.authHost)) {
    reasons.push(
      `Layer 3 Violation: Auth host "${config.authHost}" is not a local loopback address (must be 127.0.0.1 or localhost).`,
    );
  }

  // Layer 4: Emulator Flag Enforcement
  if (config.useEmulators !== 'true') {
    reasons.push(
      `Layer 4 Violation: VITE_USE_EMULATORS flag is "${config.useEmulators}" (must explicitly be "true").`,
    );
  }

  // Layer 5: Cloud Credential Suppression Check
  if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS.includes('demo')
  ) {
    reasons.push(
      `Layer 5 Violation: GOOGLE_APPLICATION_CREDENTIALS points to an external credential file: "${process.env.GOOGLE_APPLICATION_CREDENTIALS}".`,
    );
  }

  // Layer 6: Production Environment Marker Guard
  if (process.env.NODE_ENV === 'production') {
    reasons.push(
      `Layer 6 Violation: NODE_ENV is set to "production". Seeder is strictly forbidden in production environments.`,
    );
  }

  return {
    safe: reasons.length === 0,
    reasons,
  };
}

/**
 * Probes if a given local TCP port is reachable.
 * @param {string} host
 * @param {number} port
 * @returns {Promise<boolean>}
 */
export function probePortReachable(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}
