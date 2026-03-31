import * as fs from "fs";
import * as path from "path";
import { compareImages, CompareOptions, CompareResult } from "./comparator";
import { formatResult, formatBatchSummary } from "./formatter";

export interface BatchResult {
  file: string;
  result?: CompareResult;
  error?: string;
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".tiff", ".avif"]);

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/**
 * Compare all matching image files between two directories.
 */
export async function batchCompare(
  dir1: string,
  dir2: string,
  options: CompareOptions & { outputDir?: string; json?: boolean }
): Promise<BatchResult[]> {
  if (!fs.existsSync(dir1) || !fs.statSync(dir1).isDirectory()) {
    throw new Error(`Not a directory: ${dir1}`);
  }
  if (!fs.existsSync(dir2) || !fs.statSync(dir2).isDirectory()) {
    throw new Error(`Not a directory: ${dir2}`);
  }

  const files1 = fs.readdirSync(dir1).filter(isImageFile);
  const files2Set = new Set(fs.readdirSync(dir2).filter(isImageFile));

  const commonFiles = files1.filter((f) => files2Set.has(f)).sort();

  if (commonFiles.length === 0) {
    console.log("No matching image files found between the two directories.");
    return [];
  }

  const outputDir = options.outputDir || path.join(process.cwd(), "snapdiff-output");
  if (!options.json) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results: BatchResult[] = [];

  for (const file of commonFiles) {
    const beforePath = path.join(dir1, file);
    const afterPath = path.join(dir2, file);

    try {
      const diff = await compareImages(beforePath, afterPath, options);

      if (!options.json) {
        const outPath = path.join(outputDir, `diff-${file}`);
        fs.writeFileSync(outPath, diff.diffBuffer);
      }

      const { diffBuffer, ...stats } = diff;
      results.push({ file, result: stats });

      if (!options.json) {
        formatResult(file, stats);
      }
    } catch (err: any) {
      results.push({ file, error: err.message });
      if (!options.json) {
        console.log(`  \x1b[31m[ERROR]\x1b[0m ${file}: ${err.message}`);
      }
    }
  }

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    formatBatchSummary(results, outputDir);
  }

  return results;
}
