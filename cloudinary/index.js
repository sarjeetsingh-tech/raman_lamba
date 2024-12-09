const cloudinary = require('cloudinary').v2;
const { closeDelimiter } = require('ejs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryKey,
    api_secret: process.env.cloudinarySecret

});
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'yelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})
module.exports = {
    cloudinary,
    storage
}