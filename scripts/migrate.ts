import fs from 'fs';
import path from 'path';
import dbConnect from '../src/lib/db';
import InstagramGallery from '../src/models/InstagramGallery';
import Transformation from '../src/models/Transformation';
import Service from '../src/models/Service';
import Admin from '../src/models/Admin';
import bcrypt from 'bcryptjs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

const runMigration = async () => {
  await dbConnect();
  console.log('ULTIMO MIGRATION\n');

  // 1. Create Upload Directories
  const beforeDir = path.join(process.cwd(), UPLOAD_DIR, 'transformations', 'before');
  const afterDir = path.join(process.cwd(), UPLOAD_DIR, 'transformations', 'after');
  
  if (!fs.existsSync(beforeDir)) fs.mkdirSync(beforeDir, { recursive: true });
  if (!fs.existsSync(afterDir)) fs.mkdirSync(afterDir, { recursive: true });

  // 2. Migrate Instagram Gallery
  const instagramData = [
    { instagramUrl: "https://www.instagram.com/reel/Da7NV3Ok_04", sortOrder: 1 },
    { instagramUrl: "https://www.instagram.com/reel/DdYOWVzCQij", sortOrder: 2 },
    { instagramUrl: "https://www.instagram.com/reel/Dac4HbPDjnY", sortOrder: 3 },
    { instagramUrl: "https://www.instagram.com/reel/DapgFbfAorL", sortOrder: 4 },
    { instagramUrl: "https://www.instagram.com/reel/DcN9rAdEjcd", sortOrder: 5 }
  ];
  
  let instagramMigrated = 0;
  for (const item of instagramData) {
    const existing = await InstagramGallery.findOne({ instagramUrl: item.instagramUrl });
    if (!existing) {
      await InstagramGallery.create(item);
      instagramMigrated++;
    }
  }
  console.log(`Instagram Gallery\n✓ ${instagramMigrated} records migrated\n`);

  // 3. Migrate Transformations
  const assetsDir = path.join(process.cwd(), 'src', 'assets');
  let transformationsMigrated = 0;
  let imagesProcessed = 0;

  for (let i = 1; i <= 4; i++) {
    const beforeSrc = `before-${i}.jpeg`;
    const afterSrc = `after-${i}.jpeg`;
    
    const beforeAssetPath = path.join(assetsDir, beforeSrc);
    const afterAssetPath = path.join(assetsDir, afterSrc);

    if (fs.existsSync(beforeAssetPath) && fs.existsSync(afterAssetPath)) {
      const beforeDest = path.join(beforeDir, beforeSrc);
      const afterDest = path.join(afterDir, afterSrc);

      // Copy files if they don't exist in destination
      if (!fs.existsSync(beforeDest)) {
        fs.copyFileSync(beforeAssetPath, beforeDest);
        imagesProcessed++;
      }
      if (!fs.existsSync(afterDest)) {
        fs.copyFileSync(afterAssetPath, afterDest);
        imagesProcessed++;
      }

      const beforeUrl = `/uploads/transformations/before/${beforeSrc}`;
      const afterUrl = `/uploads/transformations/after/${afterSrc}`;

      const existing = await Transformation.findOne({ beforeImage: beforeUrl, afterImage: afterUrl });
      if (!existing) {
        await Transformation.create({
          beforeImage: beforeUrl,
          afterImage: afterUrl,
          sortOrder: i
        });
        transformationsMigrated++;
      }
    }
  }
  console.log(`Transformations\n✓ ${transformationsMigrated} transformations migrated\n✓ ${imagesProcessed} images processed\n`);

  // 4. Migrate Services
  const servicesData = [
    { title: "Hair Patch", slug: "hair-patch", icon: "content_cut", description: "Targeted restoration for localized balding, specifically crown thinning or receding hairlines. Custom-molded to blend seamlessly with your existing density and texture.", sortOrder: 1 },
    { title: "Hair Wig", slug: "hair-wig", icon: "person", description: "Comprehensive coverage for advanced stages of hair loss. Constructed with breathable, micro-mesh bases replicating a natural scalp.", sortOrder: 2 },
    { title: "Maintenance", slug: "maintenance", icon: "spa", description: "Exclusive clinical maintenance ensuring the longevity and pristine condition of your system. Includes cleansing, adjustments, and styling.", sortOrder: 3 }
  ];

  let servicesMigrated = 0;
  for (const item of servicesData) {
    const existing = await Service.findOne({ slug: item.slug });
    if (!existing) {
      await Service.create(item);
      servicesMigrated++;
    }
  }
  console.log(`Services\n✓ ${servicesMigrated} records migrated\n`);

  // 5. Create Default Admin
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('password123', 10);
    await Admin.create({ username: 'admin', passwordHash });
    console.log(`Admin\n✓ Default admin created (username: admin, password: password123)\n`);
  }

  console.log('Migration completed successfully.');
  process.exit(0);
};

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
