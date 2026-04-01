# @philiprehberger/date-range-ts

[![CI](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/date-range-ts.svg)](https://www.npmjs.com/package/@philiprehberger/date-range-ts)
[![Last updated](https://img.shields.io/github/last-commit/philiprehberger/date-range-ts)](https://github.com/philiprehberger/date-range-ts/commits/main)

Date range operations — overlap, gap, iterate, merge, recurring, blackout, business days, shift

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

### Recurring Ranges

Generate repeating date ranges from a pattern:

```ts
const meeting = dateRange('2026-04-06', '2026-04-06');

// Weekly recurrence, 4 occurrences
const weeklies = meeting.recurring('weekly', 4);
// [Apr 6, Apr 13, Apr 20, Apr 27]

// Monthly recurrence
const monthlies = meeting.recurring('monthly', 3);
// [Apr 6, May 6, Jun 6]
```

### Blackout Periods

Skip specific dates or ranges during iteration:

```ts
const sprint = dateRange('2026-04-01', '2026-04-10');

// Exclude specific dates
const holidays = ['2026-04-03', '2026-04-07'];
for (const day of sprint.excludeDates(holidays).iterate('day')) {
  // skips Apr 3 and Apr 7
}

// Exclude entire ranges
const vacation = dateRange('2026-04-05', '2026-04-06');
for (const day of sprint.excludeRanges([vacation]).iterate('day')) {
  // skips Apr 5-6
}
```

### Business Day Support

Count and iterate only weekdays (Mon-Fri):

```ts
const week = dateRange('2026-03-23', '2026-03-29'); // Mon-Sun

week.businessDays();  // 5

for (const day of week.iterateBusinessDays()) {
  // yields Mon, Tue, Wed, Thu, Fri only
}
```

### Range Shifting

Move an entire range forward or backward:

```ts
const event = dateRange('2026-03-15', '2026-03-20');

const postponed = event.shift({ days: 7 });
// Mar 22 - Mar 27

const earlier = event.shift({ days: -3 });
// Mar 12 - Mar 17

const nextMonth = event.shift({ months: 1 });
// Apr 15 - Apr 20
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
| `.recurring(pattern, limit)` | Generate repeating ranges |
| `.excludeDates(dates)` | Iterate skipping specific dates |
| `.excludeRanges(ranges)` | Iterate skipping date ranges |
| `.businessDays()` | Count weekdays in range |
| `.iterateBusinessDays()` | Generator yielding weekdays only |
| `.shift(duration)` | Move range by a duration |
| `mergeRanges(ranges[])` | Merge all overlapping |

## Development

```bash
npm install
npm run build
npm test
```

## Support

If you find this project useful:

⭐ [Star the repo](https://github.com/philiprehberger/date-range-ts)

🐛 [Report issues](https://github.com/philiprehberger/date-range-ts/issues?q=is%3Aissue+is%3Aopen+label%3Abug)

💡 [Suggest features](https://github.com/philiprehberger/date-range-ts/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

❤️ [Sponsor development](https://github.com/sponsors/philiprehberger)

🌐 [All Open Source Projects](https://philiprehberger.com/open-source-packages)

💻 [GitHub Profile](https://github.com/philiprehberger)

🔗 [LinkedIn Profile](https://www.linkedin.com/in/philiprehberger)

## License

[MIT](LICENSE)
