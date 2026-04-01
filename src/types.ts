export type DateInput = Date | string | number;
export type IterateStep = 'day' | 'week' | 'month' | 'year' | number;

export interface DateRangeJSON {
  start: string;
  end: string;
}

export type RecurringPattern =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | { every: IterateStep };

export interface RecurringOptions {
  pattern: RecurringPattern;
  limit: number;
}

export interface ShiftDuration {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
  ms?: number;
}
