#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { compareImages } from "./comparator";
import { batchCompare } from "./batch";
import { formatSingleResult, formatJsonResult } from "./formatter";

interface CliArgs {
  before: string;
  after: string;
  output?: string;
  threshold: number;
  json: boolean;
}

function printUsage(): void {
  console.log(`
  snapdiff — Visual image diff for UI regression testing

  Usage:
    snapdiff <before> <after> [options]

  Options:
    -o, --output <path>       Output diff image path (default: diff-output.png)
    -t, --threshold <value>   Sensitivity 0=exact, 1=loose (default: 0.1)
    --json                    Output stats as JSON
    -h, --help                Show this help

  Examples:
    snapdiff before.png after.png
    snapdiff before.png after.png -o diff.png
    snapdiff before.png after.png --threshold 0.05 --json
    snapdiff screenshots/v1/ screenshots/v2/
`);
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printUsage();
    process.exit(0);
  }

  const positional: string[] = [];
  let output: string | undefined;
  let threshold = 0.1;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-o" || arg === "--output") {
      output = args[++i];
    } else if (arg === "-t" || arg === "--threshold") {
      threshold = parseFloat(args[++i]);
      if (isNaN(threshold) || threshold < 0 || threshold > 1) {
        console.error("Error: threshold must be between 0 and 1");
        process.exit(1);
      }
    } else if (arg === "--json") {
      json = true;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  if (positional.length !== 2) {
    console.error("Error: expected exactly 2 arguments (before and after image/directory)");
    process.exit(1);
  }

  return {
    before: positional[0],
    after: positional[1],
    output,
    threshold,
    json,
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  // Check if inputs are directories -> batch mode
  const beforeIsDir = fs.existsSync(args.before) && fs.statSync(args.before).isDirectory();
  const afterIsDir = fs.existsSync(args.after) && fs.statSync(args.after).isDirectory();

  if (beforeIsDir && afterIsDir) {
    await batchCompare(args.before, args.after, {
      threshold: args.threshold,
      outputDir: args.output,
      json: args.json,
    });
    return;
  }

  if (beforeIsDir || afterIsDir) {
    console.error("Error: both arguments must be files or both must be directories");
    process.exit(1);
  }

  // Single file comparison
  if (!fs.existsSync(args.before)) {
    console.error(`File not found: ${args.before}`);
    process.exit(1);
  }
  if (!fs.existsSync(args.after)) {
    console.error(`File not found: ${args.after}`);
    process.exit(1);
  }

  const outputPath = args.output || "diff-output.png";

  try {
    const result = await compareImages(args.before, args.after, {
      threshold: args.threshold,
    });

    // Write diff image
    fs.writeFileSync(outputPath, result.diffBuffer);

    const { diffBuffer, ...stats } = result;

    if (args.json) {
      formatJsonResult(stats);
    } else {
      formatSingleResult(stats, path.resolve(outputPath));
    }

    // Exit code: 0 = match, 1 = mismatch
    process.exit(result.match ? 0 : 1);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

main();
