# @philiprehberger/date-range-ts

[![CI](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/date-range-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/date-range-ts.svg)](https://www.npmjs.com/package/@philiprehberger/date-range-ts)
[![Last updated](https://img.shields.io/github/last-commit/philiprehberger/date-range-ts)](https://github.com/philiprehberger/date-range-ts/commits/main)

Date range operations — overlap, gap, iterate, merge

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
