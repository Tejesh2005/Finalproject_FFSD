// utils/fileUpload.js
import { cloudinary } from '../config/cloudinary.js';

/**
 * Delete image from Cloudinary by public_id
 * @param {string} public_id - Cloudinary public ID of the image
 */
export const deleteFromCloudinary = async (public_id) => {
  try {
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Raw image buffer
 * @param {string} folder - Cloudinary folder (default: 'drivebidrent')
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'drivebidrent') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};