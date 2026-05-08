import express from 'express';
import multer from 'multer';
import {
	createPost,
	getAllPostsAdmin,
	getPosts,
	getMyPosts,
	getSinglePost,
	updatePost,
	deletePost,
	cleanupOrphanedImages,
	previewOrphanedImages,
	deleteSpecificImage,
	uploadTempImage,
} from '../controllers/postController.js';
import upload from '../middlewares/cloudinary.config.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 
const memoryUpload = multer({ storage: multer.memoryStorage() , limits: { fileSize: 5 * 1024 * 1024 } });

// ADMIN ROUTES FIRST (more specific)
router.get('/admin/cleanup/preview', previewOrphanedImages);
router.get('/admin/all', verifyToken, getAllPostsAdmin);
router.post('/admin/cleanup/execute', cleanupOrphanedImages);
router.delete('/admin/image', deleteSpecificImage);
router.post('/admin/upload-temp', upload.single('file'), uploadTempImage);

// PUBLIC ROUTES
router.get('/', getPosts);

// PROTECTED ROUTES
router.get('/mine', verifyToken, getMyPosts);
router.post('/', upload.single('file'), createPost);
router.put('/:id', memoryUpload.single('file'), updatePost);
router.delete('/:id', deletePost);
router.get('/:id', getSinglePost);

export default router;
