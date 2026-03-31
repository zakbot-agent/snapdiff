import sharp from "sharp";

export interface CompareOptions {
  threshold: number; // 0 = exact match, 1 = loose (default 0.1)
}

export interface CompareResult {
  totalPixels: number;
  changedPixels: number;
  percentage: number;
  match: boolean;
  width: number;
  height: number;
}

export interface DiffOutput extends CompareResult {
  diffBuffer: Buffer;
}

/**
 * Compare two images pixel-by-pixel.
 * Returns stats + a diff image buffer (PNG).
 */
export async function compareImages(
  beforePath: string,
  afterPath: string,
  options: CompareOptions = { threshold: 0.1 }
): Promise<DiffOutput> {
  const [beforeMeta, afterMeta] = await Promise.all([
    sharp(beforePath).metadata(),
    sharp(afterPath).metadata(),
  ]);

  // Use the larger dimensions to avoid cropping
  const width = Math.max(beforeMeta.width || 0, afterMeta.width || 0);
  const height = Math.max(beforeMeta.height || 0, afterMeta.height || 0);

  if (width === 0 || height === 0) {
    throw new Error("Cannot read image dimensions");
  }

  // Extract raw RGBA pixels, resized to common dimensions
  const [beforeRaw, afterRaw] = await Promise.all([
    sharp(beforePath)
      .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .raw()
      .ensureAlpha()
      .toBuffer(),
    sharp(afterPath)
      .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .raw()
      .ensureAlpha()
      .toBuffer(),
  ]);

  const totalPixels = width * height;
  const diffPixels = Buffer.alloc(width * height * 4);
  let changedPixels = 0;

  // Threshold mapped to 0-255 color distance
  const maxDistance = Math.sqrt(255 * 255 * 3); // max RGB distance
  const distThreshold = options.threshold * maxDistance;

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    const rB = beforeRaw[offset];
    const gB = beforeRaw[offset + 1];
    const bB = beforeRaw[offset + 2];

    const rA = afterRaw[offset];
    const gA = afterRaw[offset + 1];
    const bA = afterRaw[offset + 2];

    // Euclidean distance in RGB space
    const dist = Math.sqrt(
      (rB - rA) ** 2 + (gB - gA) ** 2 + (bB - bA) ** 2
    );

    if (dist > distThreshold) {
      // Changed pixel — highlight in red/magenta
      changedPixels++;
      diffPixels[offset] = 255;     // R
      diffPixels[offset + 1] = 0;   // G
      diffPixels[offset + 2] = 100; // B (magenta tint)
      diffPixels[offset + 3] = 255; // A
    } else {
      // Unchanged pixel — dimmed version of original
      diffPixels[offset] = Math.round(rB * 0.3);
      diffPixels[offset + 1] = Math.round(gB * 0.3);
      diffPixels[offset + 2] = Math.round(bB * 0.3);
      diffPixels[offset + 3] = 255;
    }
  }

  const percentage = (changedPixels / totalPixels) * 100;

  const diffBuffer = await sharp(diffPixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  return {
    totalPixels,
    changedPixels,
    percentage,
    match: changedPixels === 0,
    width,
    height,
    diffBuffer,
  };
}
