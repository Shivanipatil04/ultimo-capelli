/**
 * prepare-hero-frames.mjs
 * 
 * Generates transparent cutout frames for the hero section using
 * edge-connected flood fill from the image borders. Only white/near-white
 * pixels CONNECTED to the outside edge are removed. Interior pixels
 * (mannequin face, neck, etc.) are never removed.
 * 
 * Post-processing:
 *  - Morphological close to fill small holes in the mask
 *  - Soft alpha ramp (feather) at the outer edge for natural hair edges
 *  - De-fringe: un-premultiply against white to remove white halos
 * 
 * Usage:
 *   node scripts/prepare-hero-frames.mjs <input-dir> <wig-id>
 * 
 * Example:
 *   node scripts/prepare-hero-frames.mjs src/assets/1st-wig wig-1
 * 
 * Output: public/wigs/<wig-id>/hero/001.webp ... 036.webp
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const inputDir = process.argv[2];
const wigId = process.argv[3];

if (!inputDir || !wigId) {
  console.error("Usage: node scripts/prepare-hero-frames.mjs <input-dir> <wig-id>");
  process.exit(1);
}

// ── Bounding box detection (same as prepare-frames.mjs) ──
async function getBoundingBox(imagePath) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (info.width * y + x) * info.channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
      if (a > 10 && (r < 250 || g < 250 || b < 250)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    minX, minY, maxX, maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    originalWidth: info.width,
    originalHeight: info.height,
  };
}

/**
 * Edge-connected flood fill to find the background mask.
 * Starting from all border pixels, flood-fill outward marking pixels
 * that are "white enough" as background. Tight tolerance to protect
 * the mannequin's beige skin.
 * 
 * A pixel is considered background if:
 *  - R >= whiteThreshold AND G >= whiteThreshold AND B >= whiteThreshold
 *  - It is connected (4-directional) to a border pixel
 */
function floodFillBackground(data, width, height, channels) {
  const WHITE_THRESHOLD = 240; // Tight but catches more near-white bg between hair strands
  const len = width * height;
  const bgMask = new Uint8Array(len); // 0 = foreground, 1 = background

  // Check if a pixel is white enough to be background
  function isWhiteEnough(idx) {
    const r = data[idx * channels];
    const g = data[idx * channels + 1];
    const b = data[idx * channels + 2];
    return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
  }

  // BFS flood fill from border pixels
  const queue = [];

  // Seed all border pixels that are white enough
  for (let x = 0; x < width; x++) {
    // Top row
    if (isWhiteEnough(x)) { bgMask[x] = 1; queue.push(x); }
    // Bottom row
    const bottomIdx = (height - 1) * width + x;
    if (isWhiteEnough(bottomIdx)) { bgMask[bottomIdx] = 1; queue.push(bottomIdx); }
  }
  for (let y = 1; y < height - 1; y++) {
    // Left column
    const leftIdx = y * width;
    if (isWhiteEnough(leftIdx)) { bgMask[leftIdx] = 1; queue.push(leftIdx); }
    // Right column
    const rightIdx = y * width + (width - 1);
    if (isWhiteEnough(rightIdx)) { bgMask[rightIdx] = 1; queue.push(rightIdx); }
  }

  // BFS
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = Math.floor(idx / width);

    // 4-connected neighbors
    const neighbors = [];
    if (x > 0) neighbors.push(idx - 1);
    if (x < width - 1) neighbors.push(idx + 1);
    if (y > 0) neighbors.push(idx - width);
    if (y < height - 1) neighbors.push(idx + width);

    for (const nIdx of neighbors) {
      if (bgMask[nIdx] === 0 && isWhiteEnough(nIdx)) {
        bgMask[nIdx] = 1;
        queue.push(nIdx);
      }
    }
  }

  return bgMask;
}

/**
 * Erode the foreground mask by 1 pixel to strip the outermost white fringe.
 * Only converts foreground pixels to background if they are adjacent to bg.
 */
function erodeForeground(bgMask, width, height) {
  const eroded = new Uint8Array(bgMask);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (bgMask[idx] === 1) continue; // already background
      // Check if adjacent to background (4-connected)
      let adjBg = false;
      if (x > 0 && bgMask[idx - 1] === 1) adjBg = true;
      if (x < width - 1 && bgMask[idx + 1] === 1) adjBg = true;
      if (y > 0 && bgMask[idx - width] === 1) adjBg = true;
      if (y < height - 1 && bgMask[idx + width] === 1) adjBg = true;
      if (adjBg) eroded[idx] = 1;
    }
  }
  return eroded;
}

/**
 * Feather the mask edge: for pixels near the bg/fg boundary,
 * compute distance to nearest background pixel and create a
 * soft alpha ramp over ~2px.
 */
function featherMaskEdge(bgMask, width, height, featherRadius = 2) {
  const alpha = new Uint8Array(width * height);
  
  // Start: foreground = 255, background = 0
  for (let i = 0; i < alpha.length; i++) {
    alpha[i] = bgMask[i] === 1 ? 0 : 255;
  }

  // For each foreground pixel, find distance to nearest background pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (bgMask[idx] === 1) continue;

      let minDist = featherRadius + 1;
      for (let dy = -featherRadius; dy <= featherRadius; dy++) {
        for (let dx = -featherRadius; dx <= featherRadius; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (bgMask[ny * width + nx] === 1) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDist) minDist = dist;
            }
          }
        }
      }

      if (minDist <= featherRadius) {
        alpha[idx] = Math.round((minDist / featherRadius) * 255);
      }
    }
  }

  return alpha;
}

/**
 * De-fringe and edge color decontamination.
 * 1. Un-premultiply against white for semi-transparent pixels.
 * 2. For edge foreground pixels that are too light (whitish), replace
 *    their color with the average of nearby dark foreground pixels.
 */
function defringeAndDecontaminate(data, alphaChannel, bgMask, width, height, channels) {
  const DECONTAM_RADIUS = 3;
  const LIGHT_THRESHOLD = 220; // Pixels lighter than this at the edge get decontaminated

  // Pass 1: un-premultiply semi-transparent pixels against white
  for (let i = 0; i < width * height; i++) {
    const a = alphaChannel[i];
    if (a === 0 || a === 255) continue;
    const aFrac = a / 255;
    for (let c = 0; c < 3; c++) {
      const raw = data[i * channels + c];
      const fg = Math.round((raw - (1 - aFrac) * 255) / aFrac);
      data[i * channels + c] = Math.max(0, Math.min(255, fg));
    }
  }

  // Pass 2: decontaminate edge foreground pixels that are too light
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alphaChannel[idx] === 0) continue; // skip transparent

      // Only process edge pixels (within 2px of background)
      let nearBg = false;
      for (let dy = -2; dy <= 2 && !nearBg; dy++) {
        for (let dx = -2; dx <= 2 && !nearBg; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (bgMask[ny * width + nx] === 1) nearBg = true;
          }
        }
      }
      if (!nearBg) continue;

      const r = data[idx * channels], g = data[idx * channels + 1], b = data[idx * channels + 2];
      if (r < LIGHT_THRESHOLD || g < LIGHT_THRESHOLD || b < LIGHT_THRESHOLD) continue;

      // This edge pixel is too light — replace with avg of nearby dark fg pixels
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = -DECONTAM_RADIUS; dy <= DECONTAM_RADIUS; dy++) {
        for (let dx = -DECONTAM_RADIUS; dx <= DECONTAM_RADIUS; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nIdx = ny * width + nx;
            if (alphaChannel[nIdx] > 128 && bgMask[nIdx] === 0) {
              const nr = data[nIdx * channels], ng = data[nIdx * channels + 1], nb = data[nIdx * channels + 2];
              if (nr < LIGHT_THRESHOLD || ng < LIGHT_THRESHOLD || nb < LIGHT_THRESHOLD) {
                rSum += nr; gSum += ng; bSum += nb; count++;
              }
            }
          }
        }
      }
      if (count > 0) {
        data[idx * channels]     = Math.round(rSum / count);
        data[idx * channels + 1] = Math.round(gSum / count);
        data[idx * channels + 2] = Math.round(bSum / count);
      }
    }
  }
}

/**
 * Morphological close on the background mask to fill small holes.
 * Close = dilate foreground, then erode. This fills small bg gaps
 * inside the subject (e.g., where white reflects off the mannequin).
 */
function morphologicalCloseMask(bgMask, width, height, radius = 2) {
  const len = width * height;
  
  // Dilate foreground (= erode background)
  const dilated = new Uint8Array(len);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let anyForeground = false;
      for (let dy = -radius; dy <= radius && !anyForeground; dy++) {
        for (let dx = -radius; dx <= radius && !anyForeground; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (bgMask[ny * width + nx] === 0) anyForeground = true;
          }
        }
      }
      dilated[idx] = anyForeground ? 0 : 1; // 0 = foreground
    }
  }

  // Erode foreground back (= dilate background)
  const closed = new Uint8Array(len);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let anyBg = false;
      for (let dy = -radius; dy <= radius && !anyBg; dy++) {
        for (let dx = -radius; dx <= radius && !anyBg; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (dilated[ny * width + nx] === 1) anyBg = true;
          }
        }
      }
      closed[idx] = anyBg ? 1 : 0;
    }
  }

  return closed;
}

async function main() {
  const heroOutDir = path.join(process.cwd(), 'public', 'wigs', wigId, 'hero');
  await fs.mkdir(heroOutDir, { recursive: true });

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

  // ── Step 1: Compute bounding boxes + framing (same as main script) ──
  const boxes = [];
  console.log("Analyzing frames for bounding boxes...");
  for (const file of pngFiles) {
    boxes.push(await getBoundingBox(path.join(inputDir, file)));
  }

  const heights = [...boxes].map(b => b.height).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)];

  const TARGET_SIZE = 1024;
  const TARGET_HEIGHT = Math.round(TARGET_SIZE * 0.75);
  const TARGET_BOTTOM = Math.round(TARGET_SIZE * 0.85);
  const TARGET_CENTER_X = TARGET_SIZE / 2;

  const scale = TARGET_HEIGHT / medianHeight;
  console.log(`Median subject height: ${medianHeight}px, scale: ${scale.toFixed(3)}`);

  // ── Step 2: Process each frame ──
  let totalSize = 0;
  for (let i = 0; i < pngFiles.length; i++) {
    const file = pngFiles[i];
    const fp = path.join(inputDir, file);
    const box = boxes[i];
    const outName = String(i + 1).padStart(3, '0') + '.webp';
    const outPath = path.join(heroOutDir, outName);

    console.log(`  [${i + 1}/${pngFiles.length}] Processing ${file}...`);

    // Extract and scale the subject (same framing as main script)
    const subjW = Math.round(box.width * scale);
    const subjH = Math.round(box.height * scale);

    const subjectBuf = await sharp(fp)
      .extract({ left: box.minX, top: box.minY, width: box.width, height: box.height })
      .resize({ width: subjW, height: subjH })
      .ensureAlpha()
      .toBuffer();

    const left = Math.round(TARGET_CENTER_X - subjW / 2);
    const top = Math.round(TARGET_BOTTOM - subjH);

    // Composite onto a white 1024x1024 canvas first (to match the original frame look)
    // then do flood fill on the full composited image
    const { data: rawData, info: rawInfo } = await sharp({
      create: {
        width: TARGET_SIZE,
        height: TARGET_SIZE,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 255 },
      },
    })
      .composite([{ input: subjectBuf, left, top }])
      .raw()
      .toBuffer({ resolveWithObject: true });

    // ── Flood fill from borders to find connected background ──
    let bgMask = floodFillBackground(rawData, rawInfo.width, rawInfo.height, rawInfo.channels);

    // ── Morphological close to fill small holes inside subject ──
    bgMask = morphologicalCloseMask(bgMask, rawInfo.width, rawInfo.height, 2);

    // ── Erode foreground by 1px to strip outermost white fringe ──
    bgMask = erodeForeground(bgMask, rawInfo.width, rawInfo.height);

    // ── Feather outer edge for soft hair transitions ──
    const alphaChannel = featherMaskEdge(bgMask, rawInfo.width, rawInfo.height, 2);

    // ── De-fringe and decontaminate edge colors ──
    defringeAndDecontaminate(rawData, alphaChannel, bgMask, rawInfo.width, rawInfo.height, rawInfo.channels);

    // ── Apply alpha channel ──
    for (let j = 0; j < rawInfo.width * rawInfo.height; j++) {
      rawData[j * 4 + 3] = alphaChannel[j];
    }

    // ── Write WebP with alpha ──
    const fileInfo = await sharp(rawData, { raw: rawInfo })
      .webp({ quality: 85, alphaQuality: 100 })
      .toFile(outPath);

    totalSize += fileInfo.size;

    // Verify alpha channel exists
    const meta = await sharp(outPath).metadata();
    if (!meta.hasAlpha || meta.channels !== 4) {
      console.warn(`  ⚠ WARNING: ${outName} missing alpha! channels=${meta.channels}, hasAlpha=${meta.hasAlpha}`);
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Processed ${pngFiles.length} hero frames.`);
  console.log(`- Total size: ${(totalSize / 1024).toFixed(2)} KB (avg ${(totalSize / 1024 / pngFiles.length).toFixed(2)} KB/frame).`);
  console.log(`- Saved to: ${heroOutDir}`);
}

main().catch(console.error);
