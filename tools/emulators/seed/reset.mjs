/**
 * Sita Ram Operating System — Local Emulator Purge & Reset Utility (M0.5)
 *
 * Calls local Firebase Emulator REST APIs to completely wipe documents and auth accounts.
 * Strictly gated by the 6-layer fail-closed safety validator.
 */

import { SEED_CONFIG, validateSafetyGuard } from './config.mjs';

/**
 * Resets local Firestore and Auth emulators.
 * @param {typeof SEED_CONFIG} config
 * @returns {Promise<{ firestoreReset: boolean, authReset: boolean }>}
 */
export async function resetEmulators(config = SEED_CONFIG) {
  // Pre-flight safety check
  const safety = validateSafetyGuard(config);
  if (!safety.safe) {
    throw new Error(
      `RESET ABORTED: Fail-closed safety guard rejected execution:\n - ${safety.reasons.join('\n - ')}`,
    );
  }

  const results = {
    firestoreReset: false,
    authReset: false,
  };

  // 1. Purge Local Firestore Emulator Database
  const firestoreUrl = `http://${config.firestoreHost}/emulator/v1/projects/${config.projectId}/databases/(default)/documents`;
  try {
    const res = await fetch(firestoreUrl, { method: 'DELETE' });
    if (res.ok || res.status === 200 || res.status === 204) {
      results.firestoreReset = true;
    } else {
      const errText = await res.text().catch(() => '');
      throw new Error(`Firestore purge returned status ${res.status}: ${errText}`);
    }
  } catch (err) {
    throw new Error(`Failed to reset local Firestore emulator at ${firestoreUrl}: ${err.message}`);
  }

  // 2. Purge Local Auth Emulator Accounts
  const authUrl = `http://${config.authHost}/emulator/v1/projects/${config.projectId}/accounts`;
  try {
    const res = await fetch(authUrl, { method: 'DELETE' });
    if (res.ok || res.status === 200 || res.status === 204) {
      results.authReset = true;
    } else {
      const errText = await res.text().catch(() => '');
      throw new Error(`Auth purge returned status ${res.status}: ${errText}`);
    }
  } catch (err) {
    throw new Error(`Failed to reset local Auth emulator at ${authUrl}: ${err.message}`);
  }

  return results;
}
