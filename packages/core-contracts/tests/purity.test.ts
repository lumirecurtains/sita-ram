import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Package Purity & Zero Infrastructure Invariant Tests', () => {
  it('package.json should contain ONLY allowed runtime dependencies (zod)', () => {
    const pkgJsonPath = path.resolve(__dirname, '../package.json');
    const raw = fs.readFileSync(pkgJsonPath, 'utf8');
    const parsed = JSON.parse(raw);

    const runtimeDeps = Object.keys(parsed.dependencies || {});
    expect(runtimeDeps).toEqual(['zod']);

    const forbidden = [
      'firebase',
      'firebase-admin',
      'razorpay',
      'axios',
      'node-fetch',
      'bcrypt',
      'scrypt',
      'pg',
      'mongodb',
    ];

    for (const forbiddenDep of forbidden) {
      expect(runtimeDeps).not.toContain(forbiddenDep);
    }
  });
});
