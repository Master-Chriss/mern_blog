import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';

export const getCommentsByPost = async (req, res) => {
	const { postId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(postId)) {
		return res.status(400).json({ message: 'Invalid post id' });
	}

	const comments = await Comment.find({ post: postId })
		.populate('author', ['username', 'role'])
		.sort({ createdAt: -1 });

	res.json(comments);
};

export const createComment = async (req, res) => {
	const { postId } = req.params;
	const { content } = req.body;

	if (!mongoose.Types.ObjectId.isValid(postId)) {
		return res.status(400).json({ message: 'Invalid post id' });
	}

	const trimmedContent = content?.trim();
	if (!trimmedContent) {
		return res.status(400).json({ message: 'Comment cannot be empty' });
	}

	const postExists = await Post.exists({ _id: postId });
	if (!postExists) {
		return res.status(404).json({ message: 'Post not found' });
	}

	const comment = await Comment.create({
		post: postId,
		author: req.user.id,
		content: trimmedContent,
	});

	const populatedComment = await Comment.findById(comment._id).populate('author', [
		'username',
		'role',
	]);

	res.status(201).json(populatedComment);
};

export const deleteComment = async (req, res) => {
	const { commentId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		return res.status(400).json({ message: 'Invalid comment id' });
	}

	const comment = await Comment.findById(commentId);
	if (!comment) {
		return res.status(404).json({ message: 'Comment not found' });
	}

	const isOwner = comment.author.toString() === req.user.id;
	const isAdmin = req.user.role === 'admin';

	if (!isOwner && !isAdmin) {
		return res.status(403).json({ message: 'Not authorized to delete this comment' });
	}

	await Comment.findByIdAndDelete(commentId);
	res.json({ message: 'Comment deleted' });
};
