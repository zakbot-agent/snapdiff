import { CompareResult } from "./comparator";
import { BatchResult } from "./batch";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

export function formatResult(label: string, result: CompareResult): void {
  const pct = result.percentage.toFixed(2);
  const color = result.match ? GREEN : RED;
  const status = result.match ? "MATCH" : "MISMATCH";

  console.log(
    `  ${color}${BOLD}[${status}]${RESET} ${label} — ` +
    `${color}${pct}%${RESET} changed ` +
    `${DIM}(${result.changedPixels.toLocaleString()}/${result.totalPixels.toLocaleString()} px)${RESET}`
  );
}

export function formatSingleResult(result: CompareResult, outputPath: string): void {
  const pct = result.percentage.toFixed(2);
  const color = result.match ? GREEN : RED;
  const status = result.match ? "MATCH" : "MISMATCH";

  console.log("");
  console.log(`  ${color}${BOLD}${status}${RESET}`);
  console.log(`  Changed:  ${color}${pct}%${RESET} ${DIM}(${result.changedPixels.toLocaleString()} / ${result.totalPixels.toLocaleString()} pixels)${RESET}`);
  console.log(`  Size:     ${result.width} x ${result.height}`);
  console.log(`  Diff:     ${outputPath}`);
  console.log("");
}

export function formatJsonResult(result: CompareResult): void {
  const output = {
    totalPixels: result.totalPixels,
    changedPixels: result.changedPixels,
    percentage: parseFloat(result.percentage.toFixed(4)),
    match: result.match,
    width: result.width,
    height: result.height,
  };
  console.log(JSON.stringify(output, null, 2));
}

export function formatBatchSummary(results: BatchResult[], outputDir: string): void {
  const total = results.length;
  const matches = results.filter((r) => r.result?.match).length;
  const mismatches = results.filter((r) => r.result && !r.result.match).length;
  const errors = results.filter((r) => r.error).length;

  console.log("");
  console.log(`  ${BOLD}Summary:${RESET} ${total} files compared`);
  if (matches > 0) console.log(`  ${GREEN}${matches} matched${RESET}`);
  if (mismatches > 0) console.log(`  ${RED}${mismatches} mismatched${RESET}`);
  if (errors > 0) console.log(`  ${YELLOW}${errors} errors${RESET}`);
  console.log(`  ${DIM}Diff images saved to: ${outputDir}${RESET}`);
  console.log("");
}
