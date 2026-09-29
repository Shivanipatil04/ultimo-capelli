/**
 * verify-hero-frames.mjs
 * 
 * Composites hero cutout frames over:
 * 1. The hero's dark purple gradient (#1A1030 → #2A1750)
 * 2. Pure black
 * 3. Pure white
 * 
 * to visually check for fringing, holes, missing parts.
 * 
 * Outputs verification PNGs to public/wigs/<wig-id>/hero/_verify/
 * 
 * Usage: node scripts/verify-hero-frames.mjs <wig-id> [frame-numbers...]
 * Default frames: 1 5 10 14 19 28 (front, side, back, between)
 */

import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const wigId = process.argv[2] || 'wig-1';
const frameArgs = process.argv.slice(3).map(Number).filter(n => n > 0);
const frames = frameArgs.length > 0 ? frameArgs : [1, 5, 10, 14, 19, 28];

const heroDir = path.join(process.cwd(), 'public', 'wigs', wigId, 'hero');
const verifyDir = path.join(heroDir, '_verify');
await fs.mkdir(verifyDir, { recursive: true });

const backgrounds = [
  { name: 'purple', colors: { r: 31, g: 18, b: 53 } },   // ~ #1f1235
  { name: 'black',  colors: { r: 0,  g: 0,  b: 0  } },
  { name: 'white',  colors: { r: 255, g: 255, b: 255 } },
];

for (const frameNum of frames) {
  const frameName = String(frameNum).padStart(3, '0') + '.webp';
  const framePath = path.join(heroDir, frameName);

  try {
    await fs.access(framePath);
  } catch {
    console.log(`  Skipping frame ${frameNum} (not found)`);
    continue;
  }

  const meta = await sharp(framePath).metadata();
  console.log(`Frame ${frameNum}: ${meta.width}x${meta.height}, channels=${meta.channels}, hasAlpha=${meta.hasAlpha}`);

  for (const bg of backgrounds) {
    const outName = `frame_${String(frameNum).padStart(3, '0')}_on_${bg.name}.png`;
    await sharp({
      create: {
        width: meta.width || 1024,
        height: meta.height || 1024,
        channels: 4,
        background: { ...bg.colors, alpha: 255 },
      },
    })
      .composite([{ input: framePath, blend: 'over' }])
      .png()
      .toFile(path.join(verifyDir, outName));
  }
  console.log(`  → Saved 3 composites for frame ${frameNum}`);
}

console.log(`\nVerification images saved to: ${verifyDir}`);
console.log('Check for: face holes, white halos, jagged hair, alignment jumps.');
