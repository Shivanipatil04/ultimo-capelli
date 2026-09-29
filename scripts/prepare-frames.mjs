import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const inputDir = process.argv[2];
const wigId = process.argv[3];

if (!inputDir || !wigId) {
  console.error("Usage: node scripts/prepare-frames.mjs <input-dir> <wig-id>");
  process.exit(1);
}

async function getBoundingBox(imagePath) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  // White threshold
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (info.width * y + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      // Treat near-white as background
      if (a > 10 && (r < 250 || g < 250 || b < 250)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, originalWidth: info.width, originalHeight: info.height };
}

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'wigs', wigId);
  await fs.mkdir(outDir, { recursive: true });

  const files = await fs.readdir(inputDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  pngFiles.sort((a, b) => {
    const matchA = a.match(/-(\d+)\.png$/i);
    const matchB = b.match(/-(\d+)\.png$/i);
    const numA = matchA ? parseInt(matchA[1], 10) : 0;
    const numB = matchB ? parseInt(matchB[1], 10) : 0;
    return numA - numB;
  });

  console.log(`Found ${pngFiles.length} frames.`);

  const boxes = [];
  console.log("Analyzing frames for bounding boxes...");
  for (const file of pngFiles) {
    const fp = path.join(inputDir, file);
    boxes.push(await getBoundingBox(fp));
  }

  const heights = [...boxes].map(b => b.height).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)];
  
  // Target dimensions
  const TARGET_SIZE = 1024;
  const TARGET_HEIGHT = Math.round(TARGET_SIZE * 0.75); // Subject height in output
  const TARGET_BOTTOM = Math.round(TARGET_SIZE * 0.85); // Anchor bottom near the bottom
  const TARGET_CENTER_X = TARGET_SIZE / 2;

  const scale = TARGET_HEIGHT / medianHeight;
  console.log(`Median subject height: ${medianHeight}px. Scaling by: ${scale.toFixed(3)}`);

  let totalSize = 0;

  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const box = boxes[i];
    const fp = path.join(inputDir, file);
    
    // Scale subject
    const subjW = Math.round(box.width * scale);
    const subjH = Math.round(box.height * scale);
    
    // Check if scaled heavily
    if (Math.abs(scale - 1) > 0.5) {
      console.log(`Warning: Frame ${i + 1} scaled heavily (scale: ${scale.toFixed(2)})`);
    }

    const subjectBuf = await sharp(fp)
      .extract({ left: box.minX, top: box.minY, width: box.width, height: box.height })
      .resize({ width: subjW, height: subjH })
      .toBuffer();

    const left = Math.round(TARGET_CENTER_X - subjW / 2);
    const top = Math.round(TARGET_BOTTOM - subjH);

    const outName = String(i + 1).padStart(3, '0') + '.webp';
    const outPath = path.join(outDir, outName);

    const info = await sharp({ create: { width: TARGET_SIZE, height: TARGET_SIZE, channels: 4, background: '#ffffff' } })
      .composite([{ input: subjectBuf, left, top }])
      .flatten({ background: '#ffffff' })
      .webp({ quality: 82 })
      .toFile(outPath);

    totalSize += info.size;

    // NOTE: Transparent hero cutouts are generated separately by
    // scripts/prepare-hero-frames.mjs using AI background removal.
    // Run: node scripts/prepare-hero-frames.mjs <input-dir> <wig-id>

    if (i === 0) {
      const thumbPath = path.join(outDir, 'thumb.webp');
      await sharp(outPath).resize(200).webp({ quality: 80 }).toFile(thumbPath);
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Processed ${pngFiles.length} frames.`);
  console.log(`- Total size: ${(totalSize / 1024).toFixed(2)} KB (avg ${(totalSize / 1024 / pngFiles.length).toFixed(2)} KB/frame).`);
  console.log(`- Saved to: ${outDir}`);
}

main().catch(console.error);
