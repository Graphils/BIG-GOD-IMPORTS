const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

exports.uploadToCloudinary = (buffer, folder = 'biggod-imports') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => { if (error) reject(error); else resolve(result); }
    ).end(buffer);
  });
};

exports.deleteFromCloudinary = async (publicId) => {
  if (publicId) await cloudinary.uploader.destroy(publicId);
};
