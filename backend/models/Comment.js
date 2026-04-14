import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
	{
		post: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
			required: true,
			index: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
			maxlength: [1000, 'Comment must be less than 1000 characters'],
		},
	},
	{
		timestamps: true,
	},
);

export const Comment = mongoose.model('Comment', commentSchema);
