import type { DateInput, IterateStep, DateRangeJSON } from './types';

function toDate(input: DateInput): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${input}`);
  return d;
}

const MS_DAY = 86_400_000;
const MS_WEEK = 604_800_000;

function addStep(date: Date, step: IterateStep): Date {
  if (typeof step === 'number') return new Date(date.getTime() + step);
  switch (step) {
    case 'day': return new Date(date.getTime() + MS_DAY);
    case 'week': return new Date(date.getTime() + MS_WEEK);
    case 'month': {
      const d = new Date(date);
      d.setMonth(d.getMonth() + 1);
      return d;
    }
    case 'year': {
      const d = new Date(date);
      d.setFullYear(d.getFullYear() + 1);
      return d;
    }
  }
}

export class DateRange {
  readonly start: Date;
  readonly end: Date;

  constructor(start: DateInput, end: DateInput) {
    this.start = toDate(start);
    this.end = toDate(end);
    if (this.start > this.end) throw new Error('Start must be before or equal to end');
  }

  get duration(): number {
    return this.end.getTime() - this.start.getTime();
  }

  overlaps(other: DateRange): boolean {
    return this.start < other.end && this.end > other.start;
  }

  contains(date: DateInput): boolean {
    const d = toDate(date);
    return d >= this.start && d <= this.end;
  }

  containsRange(other: DateRange): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  isBefore(other: DateRange): boolean {
    return this.end <= other.start;
  }

  isAfter(other: DateRange): boolean {
    return this.start >= other.end;
  }

  equals(other: DateRange): boolean {
    return this.start.getTime() === other.start.getTime() && this.end.getTime() === other.end.getTime();
  }

  isAdjacent(other: DateRange): boolean {
    return this.end.getTime() === other.start.getTime() || other.end.getTime() === this.start.getTime();
  }

  intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) return null;
    return new DateRange(
      new Date(Math.max(this.start.getTime(), other.start.getTime())),
      new Date(Math.min(this.end.getTime(), other.end.getTime())),
    );
  }

  union(other: DateRange): DateRange {
    if (!this.overlaps(other) && !this.isAdjacent(other)) {
      throw new Error('Cannot merge non-overlapping, non-adjacent ranges');
    }
    return new DateRange(
      new Date(Math.min(this.start.getTime(), other.start.getTime())),
      new Date(Math.max(this.end.getTime(), other.end.getTime())),
    );
  }

  gap(other: DateRange): DateRange | null {
    if (this.overlaps(other) || this.isAdjacent(other)) return null;
    const [first, second] = this.isBefore(other) ? [this, other] : [other, this];
    return new DateRange(first.end, second.start);
  }

  *iterate(step: IterateStep): Generator<Date> {
    let current = new Date(this.start);
    while (current <= this.end) {
      yield new Date(current);
      current = addStep(current, step);
    }
  }

  splitBy(step: IterateStep): DateRange[] {
    const ranges: DateRange[] = [];
    let current = new Date(this.start);
    while (current < this.end) {
      const next = addStep(current, step);
      const rangeEnd = next > this.end ? this.end : next;
      ranges.push(new DateRange(current, rangeEnd));
      current = next;
    }
    return ranges;
  }

  durationIn(unit: 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks'): number {
    const ms = this.duration;
    switch (unit) {
      case 'ms': return ms;
      case 'seconds': return ms / 1000;
      case 'minutes': return ms / 60_000;
      case 'hours': return ms / 3_600_000;
      case 'days': return ms / MS_DAY;
      case 'weeks': return ms / MS_WEEK;
    }
  }

  toString(): string {
    return `${this.start.toISOString()}/${this.end.toISOString()}`;
  }

  toJSON(): DateRangeJSON {
    return { start: this.start.toISOString(), end: this.end.toISOString() };
  }
}

export function dateRange(start: DateInput, end: DateInput): DateRange {
  return new DateRange(start, end);
}

export function mergeRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: DateRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (last.overlaps(sorted[i]) || last.isAdjacent(sorted[i])) {
      merged[merged.length - 1] = last.union(sorted[i]);
    } else {
      merged.push(sorted[i]);
    }
  }

  return merged;
}
