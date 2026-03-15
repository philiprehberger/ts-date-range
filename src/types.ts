export type DateInput = Date | string | number;
export type IterateStep = 'day' | 'week' | 'month' | 'year' | number;

export interface DateRangeJSON {
  start: string;
  end: string;
}
