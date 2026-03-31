# snapdiff

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)

> Visual diff between 2 images. Highlights pixel differences for UI regression testing.

## Features

- CLI tool
- TypeScript support

## Tech Stack

**Runtime:**
- TypeScript v5.9.3

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

```bash
cd snapdiff
npm install
```

Or install globally:

```bash
npm install -g snapdiff
```

## Usage

### CLI

```bash
snapdiff
```

### Available Scripts

| Script | Command |
|--------|---------|
| `npm run build` | `tsc` |
| `npm run test` | `node test/generate-test-images.js && node dist/index.js test/before.png test/after.png -o test/diff.png --json` |

## Project Structure

```
├── src
│   ├── batch.ts
│   ├── comparator.ts
│   ├── formatter.ts
│   └── index.ts
├── test
│   ├── batch-output
│   │   └── diff-page.png
│   ├── dir1
│   │   └── page.png
│   ├── dir2
│   │   └── page.png
│   ├── after.png
│   ├── before.png
│   ├── diff.png
│   └── generate-test-images.js
├── diff-output.png
├── package.json
├── README.md
└── tsconfig.json
```

## Testing

This project uses **Custom** for testing.

```bash
npm test
```

## License

This project is licensed under the **MIT** license.

## Author

**Zakaria Kone**

---
> Maintained by [zakbot-agent](https://github.com/zakbot-agent) & [ZakariaDev000](https://github.com/ZakariaDev000)
