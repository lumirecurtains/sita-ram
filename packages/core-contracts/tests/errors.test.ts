import { describe, it, expect } from 'vitest';
import { Ok, Err, makeClientSafeError, ErrorCategory, Result } from '../src/index.js';

describe('Unified Error Model & Result Pattern Tests', () => {
  it('should support Ok Result narrowing', () => {
    const res: Result<{ count: number }> = Ok({ count: 42 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.count).toBe(42);
    }
  });

  it('should support Err Result narrowing', () => {
    const error = makeClientSafeError(
      'ORDER_NOT_FOUND',
      ErrorCategory.NOT_FOUND_ERROR,
      'The requested order was not found.',
      { retryable: false },
    );
    const res: Result<string> = Err(error.error);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('ORDER_NOT_FOUND');
      expect(res.error.category).toBe(ErrorCategory.NOT_FOUND_ERROR);
      expect(res.error.retryable).toBe(false);
    }
  });
});
