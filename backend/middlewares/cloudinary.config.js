import cloudinary from 'cloudinary';
import multer from 'multer';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// The storage lib expects a root object with a .v2 property
const storage = createCloudinaryStorage({
	cloudinary,
	params: {
		folder: 'blog-images',
		allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
		transformation: [{ width: 1000, crop: 'limit' }],
	},
});

// Test the connection
cloudinary.v2.api
	.ping()
	.then((result) => console.log('Cloudinary connected:', result))
	.catch((err) => console.error('Cloudinary connection failed:', err));

const upload = multer({ storage });

export default upload;
