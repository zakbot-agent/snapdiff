const sharp = require("sharp");
const path = require("path");

async function generate() {
  const width = 200;
  const height = 200;

  // "before" image: blue rectangle with a green square in the center
  const beforePixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      if (x >= 60 && x < 140 && y >= 60 && y < 140) {
        // Green center square
        beforePixels[i] = 50;
        beforePixels[i + 1] = 180;
        beforePixels[i + 2] = 50;
      } else {
        // Blue background
        beforePixels[i] = 30;
        beforePixels[i + 1] = 80;
        beforePixels[i + 2] = 200;
      }
    }
  }

  // "after" image: same but green square shifted right by 20px + color slightly changed
  const afterPixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      if (x >= 80 && x < 160 && y >= 60 && y < 140) {
        // Yellow-green center square (shifted + color changed)
        afterPixels[i] = 80;
        afterPixels[i + 1] = 200;
        afterPixels[i + 2] = 30;
      } else {
        // Blue background (same)
        afterPixels[i] = 30;
        afterPixels[i + 1] = 80;
        afterPixels[i + 2] = 200;
      }
    }
  }

  const testDir = path.join(__dirname);

  await sharp(beforePixels, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(path.join(testDir, "before.png"));

  await sharp(afterPixels, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(path.join(testDir, "after.png"));

  // Create a copy for batch test
  const batchDir1 = path.join(testDir, "dir1");
  const batchDir2 = path.join(testDir, "dir2");
  const fs = require("fs");
  fs.mkdirSync(batchDir1, { recursive: true });
  fs.mkdirSync(batchDir2, { recursive: true });

  await sharp(beforePixels, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(path.join(batchDir1, "page.png"));

  await sharp(afterPixels, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(path.join(batchDir2, "page.png"));

  console.log("Test images generated in", testDir);
}

generate().catch(console.error);
