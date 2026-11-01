import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file (path, base64, or buffer) to Cloudinary in structured folder path.
 * Falls back to local file storage if Cloudinary fails.
 * @param {string} filePath 
 * @param {string} userId 
 * @param {string} profileId 
 * @param {string} category 
 * @returns {Promise<{fileUrl: string, publicId: string}>}
 */
export async function uploadToCloudinary(filePath, userId, profileId, category) {
  const folder = `reports/${userId}/${profileId}/${category.replace(/\s+/g, '_')}`;

  // Try Cloudinary first
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
      });

      return {
        fileUrl: result.secure_url,
        publicId: result.public_id,
        storage: 'cloudinary',
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error.message);
      console.warn('Falling back to local file storage');
    }
  } else {
    console.warn('Cloudinary credentials missing. Using local file storage.');
  }

  // Fallback: Use local file storage
  const fs = await import('fs');
  const path = await import('path');
  
  const fileName = path.basename(filePath);
  const localFolder = path.join('public', 'uploads', folder);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(localFolder)) {
    fs.mkdirSync(localFolder, { recursive: true });
  }
  
  const localPath = path.join(localFolder, fileName);
  fs.copyFileSync(filePath, localPath);
  
  return {
    fileUrl: `/uploads/${folder}/${fileName}`,
    publicId: `${folder}/${fileName}`,
    storage: 'local',
  };
}

/**
 * Deletes a file from Cloudinary using publicId.
 * @param {string} publicId 
 * @returns {Promise<object>}
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId) return { result: 'ok' };

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('Cloudinary credentials missing. Skipping remote deletion.');
    return { result: 'ok' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw to allow DB record deletion to proceed
    return { result: 'error', error: error.message };
  }
}


/** Logs at startup whether the Cloudinary credentials actually work (bad keys are a common silent failure). */
export async function checkCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary: NOT configured (set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Reports are stored locally.');
    return false;
  }
  try {
    await cloudinary.api.ping();
    console.log(`Cloudinary: connected (cloud "${process.env.CLOUDINARY_CLOUD_NAME}")`);
    return true;
  } catch (err) {
    console.error('Cloudinary: connection failed -', err.message || err.error?.message);
    console.error('Error details:', err);
    console.warn('Falling back to local storage');
    return false;
  }
}
