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

  it('clamp() trims overlapping range to bounding window', () => {
    const range = mod.dateRange('2026-03-01', '2026-03-31');
    const bounds = mod.dateRange('2026-03-10', '2026-03-20');
    const clamped = range.clamp(bounds);
    assert.ok(clamped);
    assert.equal(clamped.start.getTime(), new Date('2026-03-10').getTime());
    assert.equal(clamped.end.getTime(), new Date('2026-03-20').getTime());
  });

  it('clamp() returns null when ranges are disjoint', () => {
    const range = mod.dateRange('2026-03-01', '2026-03-05');
    const bounds = mod.dateRange('2026-04-01', '2026-04-10');
    assert.equal(range.clamp(bounds), null);
  });

  it('clamp() accepts a plain object literal as bounds', () => {
    const range = mod.dateRange('2026-03-01', '2026-03-31');
    const clamped = range.clamp({ start: '2026-03-15', end: '2026-03-25' });
    assert.ok(clamped);
    assert.equal(clamped.start.getTime(), new Date('2026-03-15').getTime());
    assert.equal(clamped.end.getTime(), new Date('2026-03-25').getTime());
  });
});
