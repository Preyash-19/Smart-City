import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(backendDir, 'uploads');

// Ensure uploads folder exists for local storage
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 10 MB per-image maximum limit
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Validates the file signature (magic bytes) to ensure authentic image data.
 * Protects against spoofed file extensions.
 */
export function detectImageMimeAndExtension(buffer) {
  if (!buffer || buffer.length < 8) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }

  // GIF: GIF87a / GIF89a
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  ) {
    return { mime: 'image/gif', ext: 'gif' };
  }

  return null;
}

/**
 * Generates an unguessable, sanitized filename for storage.
 */
export function generateSafeFilename(ext) {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `civic_${timestamp}_${randomSuffix}.${ext}`;
}

/**
 * Validates whether Cloudinary configuration variables are set.
 */
export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Unified storage upload function.
 * Supports:
 * - STORAGE_PROVIDER=local (default, writes to backend/uploads/)
 * - STORAGE_PROVIDER=cloudinary (uploads to Cloudinary via server-side stream)
 */
export async function uploadImageBuffer({ buffer, originalName = '' }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image payload: buffer required.');
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Image size exceeds the maximum limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }

  const detected = detectImageMimeAndExtension(buffer);
  if (!detected) {
    throw new Error('Unsupported or malformed image format. Only JPEG, PNG, WebP, and GIF are permitted.');
  }

  const filename = generateSafeFilename(detected.ext);
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();

  // Cloudinary storage provider
  if (provider === 'cloudinary') {
    if (!isCloudinaryConfigured()) {
      console.warn('[STORAGE] STORAGE_PROVIDER=cloudinary declared, but credentials are incomplete. Falling back to local filesystem.');
      return saveToLocalStorage(buffer, filename);
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const folder = process.env.CLOUDINARY_FOLDER || 'smart-city-complaints';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: path.parse(filename).name,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('[STORAGE] Cloudinary upload error:', error.message);
            return reject(new Error('Cloud image storage upload failed.'));
          }
          resolve({
            imageUrl: result.secure_url,
            filename: `${result.public_id}.${detected.ext}`,
            provider: 'cloudinary'
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Default: local filesystem storage
  return saveToLocalStorage(buffer, filename);
}

/**
 * Saves buffer to the local uploads directory and constructs public URL.
 */
async function saveToLocalStorage(buffer, filename) {
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  const storageBase = process.env.STORAGE_BASE_URL || `http://localhost:${process.env.PORT || 5000}/uploads`;
  const normalizedBase = storageBase.replace(/\/+$/, '');
  const imageUrl = `${normalizedBase}/${filename}`;

  return {
    imageUrl,
    filename,
    provider: 'local'
  };
}

/**
 * Ensures existing URLs are safely formatted for response and display.
 * If the URL is already an absolute external/cloud URL (http:// or https://), it is preserved as-is.
 * If it is a relative upload path, it is prefixed with the active STORAGE_BASE_URL.
 */
export function formatImageUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = String(rawUrl).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const storageBase = process.env.STORAGE_BASE_URL || `http://localhost:${process.env.PORT || 5000}/uploads`;
  const normalizedBase = storageBase.replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '').replace(/^uploads\/+/, '');
  return `${normalizedBase}/${cleanPath}`;
}
