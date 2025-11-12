const { cloudinary } = require('../config/cloudinary');

const deleteFromCloudinary = async (public_id) => {
  try {
    if (public_id) {
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

const uploadToCloudinary = async (fileBuffer, folder = 'drivebidrent') => {
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

module.exports = { deleteFromCloudinary, uploadToCloudinary };