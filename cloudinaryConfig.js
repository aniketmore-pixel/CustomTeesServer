// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dyd9xroga', // replace with your Cloudinary cloud name
  api_key: '889813365132373',       // replace with your Cloudinary API key
  api_secret: '_MBolIgGsYZl1MHUee-uroBGE9Y', // replace with your Cloudinary API secret
});

module.exports = cloudinary;
