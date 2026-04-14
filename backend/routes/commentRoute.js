import express from 'express';
import {
	createComment,
	deleteComment,
	getCommentsByPost,
} from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', verifyToken, createComment);
router.delete('/:commentId', verifyToken, deleteComment);

export default router;
