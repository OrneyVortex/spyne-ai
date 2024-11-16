import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Set up Cloudinary storage with multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-management', // Specify the Cloudinary folder where images will be stored
    allowed_formats: ['jpg', 'jpeg', 'png'], // Limit allowed formats
    transformation: [{ width: 800, height: 600, crop: 'limit' }], // Resize images to a max width/height
  } as any,
});

const upload = multer({ storage });

export default upload;