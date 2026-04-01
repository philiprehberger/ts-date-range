import type { DateInput, IterateStep, DateRangeJSON, RecurringPattern, ShiftDuration } from './types';

function toDate(input: DateInput): Date {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${input}`);
  return d;
}

const MS_DAY = 86_400_000;
const MS_WEEK = 604_800_000;

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function patternToStep(pattern: RecurringPattern): IterateStep {
  if (typeof pattern === 'object') return pattern.every;
  switch (pattern) {
    case 'daily': return 'day';
    case 'weekly': return 'week';
    case 'monthly': return 'month';
    case 'yearly': return 'year';
  }
}

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

  recurring(pattern: RecurringPattern, limit: number): DateRange[] {
    const step = patternToStep(pattern);
    const rangeDuration = this.duration;
    const ranges: DateRange[] = [];
    let currentStart = new Date(this.start);

    for (let i = 0; i < limit; i++) {
      const currentEnd = new Date(currentStart.getTime() + rangeDuration);
      ranges.push(new DateRange(currentStart, currentEnd));
      currentStart = addStep(currentStart, step);
    }

    return ranges;
  }

  excludeDates(dates: DateInput[]): { iterate: (step: IterateStep) => Generator<Date> } {
    const excludedDates = dates.map((d) => toDate(d));
    const range = this;
    return {
      *iterate(step: IterateStep): Generator<Date> {
        for (const date of range.iterate(step)) {
          if (!excludedDates.some((ex) => isSameDay(ex, date))) {
            yield date;
          }
        }
      },
    };
  }

  excludeRanges(ranges: DateRange[]): { iterate: (step: IterateStep) => Generator<Date> } {
    const parentRange = this;
    return {
      *iterate(step: IterateStep): Generator<Date> {
        for (const date of parentRange.iterate(step)) {
          const excluded = ranges.some((r) => date >= r.start && date <= r.end);
          if (!excluded) {
            yield date;
          }
        }
      },
    };
  }

  businessDays(): number {
    let count = 0;
    let current = new Date(this.start);
    while (current <= this.end) {
      if (isWeekday(current)) count++;
      current = new Date(current.getTime() + MS_DAY);
    }
    return count;
  }

  *iterateBusinessDays(): Generator<Date> {
    let current = new Date(this.start);
    while (current <= this.end) {
      if (isWeekday(current)) {
        yield new Date(current);
      }
      current = new Date(current.getTime() + MS_DAY);
    }
  }

  shift(duration: ShiftDuration): DateRange {
    let start = new Date(this.start);
    let end = new Date(this.end);

    if (duration.ms) {
      start = new Date(start.getTime() + duration.ms);
      end = new Date(end.getTime() + duration.ms);
    }
    if (duration.days) {
      start = new Date(start.getTime() + duration.days * MS_DAY);
      end = new Date(end.getTime() + duration.days * MS_DAY);
    }
    if (duration.weeks) {
      start = new Date(start.getTime() + duration.weeks * MS_WEEK);
      end = new Date(end.getTime() + duration.weeks * MS_WEEK);
    }
    if (duration.months) {
      start.setMonth(start.getMonth() + duration.months);
      end.setMonth(end.getMonth() + duration.months);
    }
    if (duration.years) {
      start.setFullYear(start.getFullYear() + duration.years);
      end.setFullYear(end.getFullYear() + duration.years);
    }

    return new DateRange(start, end);
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
