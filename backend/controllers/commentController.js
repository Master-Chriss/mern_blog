import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';

const populateCommentAuthor = (query) =>
	query.populate('author', ['username', 'role']);

export const getCommentsByPost = async (req, res) => {
	const { postId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(postId)) {
		return res.status(400).json({ message: 'Invalid post id' });
	}

	try {
		const comments = await populateCommentAuthor(
			Comment.find({ post: postId }).sort({ createdAt: -1 }),
		);

		res.json(comments);
	} catch (error) {
		console.error('Error fetching comments by post:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const getAuthorInbox = async (req, res) => {
	try {
		if (req.user.role !== 'author' && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Not authorized to view author inbox' });
		}

		const authoredPosts = await Post.find({ author: req.user.id }, '_id title');
		const postIds = authoredPosts.map((post) => post._id);
		const postMap = new Map(
			authoredPosts.map((post) => [post._id.toString(), post.title]),
		);

		if (postIds.length === 0) {
			return res.json({
				activities: [],
				summary: {
					totalReaderMessages: 0,
					recentReaderMessages: 0,
					activePosts: 0,
					uniqueReaders: 0,
				},
			});
		}

		const comments = await populateCommentAuthor(
			Comment.find({
				post: { $in: postIds },
				author: { $ne: req.user.id },
			})
				.populate('post', ['title'])
				.sort({ createdAt: -1 })
				.limit(12),
		);

		const allReaderComments = await Comment.find({
			post: { $in: postIds },
			author: { $ne: req.user.id },
		}).select('author post createdAt');

		const activities = comments.map((comment) => ({
			_id: comment._id,
			type: comment.parentComment ? 'reply' : 'comment',
			content: comment.content,
			createdAt: comment.createdAt,
			post: {
				_id: comment.post?._id || comment.post,
				title:
					comment.post?.title ||
					postMap.get(comment.post?._id?.toString?.() || comment.post?.toString?.()) ||
					'Untitled post',
			},
			author: comment.author,
		}));

		const lastSevenDays = new Date();
		lastSevenDays.setDate(lastSevenDays.getDate() - 7);

		const uniqueReaders = new Set(
			allReaderComments.map((comment) => comment.author.toString()),
		).size;
		const activePosts = new Set(
			allReaderComments.map((comment) => comment.post.toString()),
		).size;
		const recentReaderMessages = allReaderComments.filter(
			(comment) => new Date(comment.createdAt) >= lastSevenDays,
		).length;

		res.json({
			activities,
			summary: {
				totalReaderMessages: allReaderComments.length,
				recentReaderMessages,
				activePosts,
				uniqueReaders,
			},
		});
	} catch (error) {
		console.error('Error fetching author inbox:', error);
		res.status(500).json({ message: 'Internal Server error' });
	}
};

export const createComment = async (req, res) => {
	const { postId } = req.params;
	const { content, parentCommentId } = req.body;

	if (!mongoose.Types.ObjectId.isValid(postId)) {
		return res.status(400).json({ message: 'Invalid post id' });
	}

	const trimmedContent = content?.trim();
	if (!trimmedContent) {
		return res.status(400).json({ message: 'Comment cannot be empty' });
	}

	try {
		const postExists = await Post.exists({ _id: postId });
		if (!postExists) {
			return res.status(404).json({ message: 'Post not found' });
		}

		let validatedParentCommentId = null;

		if (parentCommentId) {
			if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
				return res.status(400).json({ message: 'Invalid parent comment id' });
			}

			const parentComment = await Comment.findOne({
				_id: parentCommentId,
				post: postId,
			});

			if (!parentComment) {
				return res.status(404).json({ message: 'Parent comment not found' });
			}

			validatedParentCommentId = parentCommentId;
		}

		const comment = await Comment.create({
			post: postId,
			author: req.user.id,
			parentComment: validatedParentCommentId,
			content: trimmedContent,
		});

		const populatedComment = await populateCommentAuthor(
			Comment.findById(comment._id),
		);

		res.status(201).json(populatedComment);
	} catch (error) {
		console.error('Error creating comment:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const deleteComment = async (req, res) => {
	const { commentId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		return res.status(400).json({ message: 'Invalid comment id' });
	}

	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		const isOwner = comment.author.toString() === req.user.id;
		const isAdmin = req.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: 'Not authorized to delete this comment' });
		}

		await Comment.deleteMany({
			$or: [{ _id: commentId }, { parentComment: commentId }],
		});
		res.json({ message: 'Comment deleted' });
	} catch (error) {
		console.error('Error deleting comment:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const toggleCommentLike = async (req, res) => {
	const { commentId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(commentId)) {
		return res.status(400).json({ message: 'Invalid comment id' });
	}

	try {
		const comment = await Comment.findById(commentId);
		if (!comment) {
			return res.status(404).json({ message: 'Comment not found' });
		}

		const userId = req.user.id;
		const alreadyLiked = comment.likedBy.some((id) => id.toString() === userId);

		if (alreadyLiked) {
			comment.likedBy = comment.likedBy.filter((id) => id.toString() !== userId);
		} else {
			comment.likedBy.push(userId);
		}

		await comment.save();

		const populatedComment = await populateCommentAuthor(
			Comment.findById(comment._id),
		);

		res.json({
			message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
			comment: populatedComment,
		});
	} catch (error) {
		console.error('Error toggling comment like:', error);
		res.status(500).json({ message: 'Server error' });
	}
};

export const deleteCommentReply = async (req, res) => {
	const { commentId, replyId } = req.params;

	if (
		!mongoose.Types.ObjectId.isValid(commentId) ||
		!mongoose.Types.ObjectId.isValid(replyId)
	) {
		return res.status(400).json({ message: 'Invalid comment id' });
	}

	try {
		const reply = await Comment.findOne({
			_id: replyId,
			parentComment: commentId,
		});

		if (!reply) {
			return res.status(404).json({ message: 'Reply not found' });
		}

		const isOwner = reply.author.toString() === req.user.id;
		const isAdmin = req.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: 'Not authorized to delete this reply' });
		}

		await Comment.findByIdAndDelete(replyId);
		res.json({ message: 'Reply deleted' });
	} catch (error) {
		console.error('Error deleting reply:', error);
		res.status(500).json({ message: 'Server error' });
	}
};
