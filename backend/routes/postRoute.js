import express from 'express';
import {
	createPost,
	getPosts,
	getSinglePost,
	updatePost,
	deletePost,
	cleanupOrphanedImages,
	previewOrphanedImages,
	deleteSpecificImage,
} from '../controllers/postController.js';
import upload  from '../middlewares/cloudinary.config.js';

const router = express.Router();

// ADMIN ROUTES FIRST (more specific)
router.get('/admin/cleanup/preview', previewOrphanedImages);
router.post('/admin/cleanup/execute', cleanupOrphanedImages);
router.delete('/admin/image', deleteSpecificImage);

//  PUBLIC ROUTES (less specific)
router.get('/', getPosts);
router.get('/:id', getSinglePost); // This comes AFTER admin routes!

//  PROTECTED ROUTES
router.post('/', upload.single('file'), createPost);
router.put('/:id', upload.single('file'), updatePost);
router.delete('/:id', deletePost);

export default router;
