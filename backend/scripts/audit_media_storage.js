import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditMedia() {
  console.log('=== MEDIA & IMAGE STORAGE AUDIT ===\n');

  const complaints = await prisma.complaint.findMany({
    select: {
      id: true,
      imageUrl: true,
      voiceUrl: true,
      completionImage: true,
      status: true
    }
  });

  console.log(`Total Complaints in DB: ${complaints.length}`);

  let localUploadCount = 0;
  let externalUrlCount = 0;
  let voiceCount = 0;
  let completionCount = 0;
  const localFilenamesInDb = new Set();
  const externalDomains = new Set();

  for (const c of complaints) {
    if (c.imageUrl) {
      if (c.imageUrl.includes('/uploads/')) {
        localUploadCount++;
        const filename = c.imageUrl.split('/uploads/')[1]?.split('?')[0];
        if (filename) localFilenamesInDb.add(filename);
      } else {
        externalUrlCount++;
        try {
          const u = new URL(c.imageUrl);
          externalDomains.add(u.hostname);
        } catch (e) {
          externalDomains.add('unknown/relative');
        }
      }
    }
    if (c.voiceUrl) voiceCount++;
    if (c.completionImage) completionCount++;
  }

  console.log(`\nImage URL breakdown:`);
  console.log(`  - Local uploads (/uploads/): ${localUploadCount}`);
  console.log(`  - Distinct local files referenced in DB: ${localFilenamesInDb.size}`);
  console.log(`  - External URLs: ${externalUrlCount} (Domains: ${Array.from(externalDomains).join(', ')})`);
  console.log(`  - Empty/blank/null imageUrl: ${complaints.filter(c => !c.imageUrl).length}`);
  const otherUrls = complaints.filter(c => c.imageUrl && !c.imageUrl.includes('/uploads/') && !c.imageUrl.startsWith('http'));
  console.log(`  - Relative/other imageUrls: ${otherUrls.length}`);
  if (otherUrls.length > 0) {
    console.log(`    Sample:`, otherUrls.slice(0, 3).map(c => c.imageUrl));
  }
  const httpOther = complaints.filter(c => c.imageUrl && !c.imageUrl.includes('/uploads/') && c.imageUrl.startsWith('http') && !c.imageUrl.includes('cloudinary') && !c.imageUrl.includes('unsplash'));
  console.log(`  - Other HTTP domains: ${httpOther.length}`);
  if (httpOther.length > 0) {
    console.log(`    Sample:`, httpOther.slice(0, 3).map(c => c.imageUrl));
  }
  console.log(`  - Voice notes (voiceUrl): ${voiceCount}`);
  console.log(`  - Completion images (completionImage): ${completionCount}`);

  // Inspect backend/uploads directory on disk
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const diskFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  console.log(`\nDisk uploads check (${uploadsDir}):`);
  console.log(`  - Total files on disk: ${diskFiles.length}`);

  let matchedOnDisk = 0;
  let missingOnDisk = 0;
  for (const fn of localFilenamesInDb) {
    if (diskFiles.includes(fn)) {
      matchedOnDisk++;
    } else {
      missingOnDisk++;
      console.log(`    Missing from disk: ${fn}`);
    }
  }

  let unreferencedOnDisk = 0;
  for (const f of diskFiles) {
    if (!localFilenamesInDb.has(f)) {
      unreferencedOnDisk++;
    }
  }

  console.log(`  - DB references matched on disk: ${matchedOnDisk}`);
  console.log(`  - DB references missing on disk: ${missingOnDisk}`);
  console.log(`  - Disk files unreferenced in DB: ${unreferencedOnDisk}`);
}

auditMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
