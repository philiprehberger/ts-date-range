import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../../dist/index.js');

describe('date-range-ts', () => {
  it('should export DateRange', () => {
    assert.ok(mod.DateRange);
  });

  it('should export dateRange', () => {
    assert.ok(mod.dateRange);
  });

  it('should export mergeRanges', () => {
    assert.ok(mod.mergeRanges);
  });
});
