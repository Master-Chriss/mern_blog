import express from 'express';
import {
	createPost,
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

// ADMIN ROUTES FIRST (more specific)
router.get('/admin/cleanup/preview', previewOrphanedImages);
router.post('/admin/cleanup/execute', cleanupOrphanedImages);
router.delete('/admin/image', deleteSpecificImage);
router.post('/admin/upload-temp', upload.single('file'), uploadTempImage);

//  PUBLIC ROUTES (less specific)
router.get('/', getPosts);

//  PROTECTED ROUTES
router.get('/mine', verifyToken, getMyPosts);
router.post('/', upload.single('file'), createPost);
router.put('/:id', upload.single('file'), updatePost);
router.delete('/:id', deletePost);
router.get('/:id', getSinglePost); // This comes AFTER specific routes

export default router;
