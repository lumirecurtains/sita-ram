import { describe, it, expect } from 'vitest';
import { makeMoney, Money } from '../src/index.js';

describe('Monetary Integer Minor Units Tests', () => {
  it('should create valid Money objects with integer minor units', () => {
    const price: Money = makeMoney(22050, 'INR');
    expect(price.amountMinor).toBe(22050);
    expect(price.currency).toBe('INR');
  });

  it('should default to INR currency', () => {
    const price = makeMoney(500);
    expect(price.currency).toBe('INR');
  });

  it('should throw TypeError when given floating point values', () => {
    expect(() => makeMoney(220.5)).toThrow(TypeError);
    expect(() => makeMoney(10.0001)).toThrow(TypeError);
  });
});
