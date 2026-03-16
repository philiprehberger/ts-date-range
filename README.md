# @philiprehberger/date-range-ts

[![CI](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/date-range-ts.svg)](https://www.npmjs.com/package/@philiprehberger/date-range-ts)
[![License](https://img.shields.io/github/license/philiprehberger/date-range-ts)](LICENSE)

Date range operations — overlap, gap, iterate, merge.

## Installation

```bash
npm install @philiprehberger/date-range-ts
```

## Usage

```ts
import { dateRange, mergeRanges } from '@philiprehberger/date-range-ts';

const booking = dateRange('2026-03-15', '2026-03-20');
const request = dateRange('2026-03-18', '2026-03-25');

booking.overlaps(request);              // true
booking.intersection(request);          // March 18-20
booking.durationIn('days');             // 5

for (const day of booking.iterate('day')) { /* ... */ }

mergeRanges([range1, range2, range3]);  // merged, non-overlapping
```

## API

| Method | Description |
|--------|-------------|
| `dateRange(start, end)` | Create a date range |
| `.overlaps(other)` | Check if ranges overlap |
| `.contains(date)` / `.containsRange(other)` | Containment checks |
| `.intersection(other)` | Overlapping portion |
| `.union(other)` | Merge two ranges |
| `.gap(other)` | Gap between ranges |
| `.iterate(step)` | Generator yielding dates |
| `.splitBy(step)` | Split into sub-ranges |
| `.durationIn(unit)` | Duration as number |
| `mergeRanges(ranges[])` | Merge all overlapping |

## License

MIT
