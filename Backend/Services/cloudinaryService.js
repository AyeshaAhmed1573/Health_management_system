import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file (path, base64, or buffer) to Cloudinary in structured folder path.
 * @param {string} filePath 
 * @param {string} userId 
 * @param {string} profileId 
 * @param {string} category 
 * @returns {Promise<{fileUrl: string, publicId: string}>}
 */
export async function uploadToCloudinary(filePath, userId, profileId, category) {
  const folder = `reports/${userId}/${profileId}/${category.replace(/\s+/g, '_')}`;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('Cloudinary environment variables missing. Returning fallback upload structure.');
    const mockPublicId = `${folder}/mock_${Date.now()}`;
    return {
      fileUrl: filePath?.startsWith('http') ? filePath : 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      publicId: mockPublicId,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });

    return {
      fileUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
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
