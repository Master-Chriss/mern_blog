import express from 'express';
import {
	createComment,
	deleteComment,
	deleteCommentReply,
	getCommentsByPost,
	toggleCommentLike,
} from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/post/:postId', verifyToken, createComment);
router.post('/:commentId/like', verifyToken, toggleCommentLike);
router.delete('/:commentId/replies/:replyId', verifyToken, deleteCommentReply);
router.delete('/:commentId', verifyToken, deleteComment);

export default router;
