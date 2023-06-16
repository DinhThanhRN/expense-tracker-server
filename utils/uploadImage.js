const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload
exports.uploadImage = async (path, saveAs = "") => {
  const options = {
    public_id: saveAs,
    unique_filename: false,
    overwrite: true,
  };
  const response = await cloudinary.uploader.upload(path, options);
  return response.secure_url;
};

// Generate
exports.downloadImageURL = (name, options = {}) => {
  return cloudinary.url(name, options);
};
