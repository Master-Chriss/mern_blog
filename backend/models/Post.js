import mongoose from 'mongoose';
const { Schema } = mongoose;

// Defining a post schema/blueprint
const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxlength: [200, 'Title must be less than 200 characters'],
		},
		summary: {
			type: String,
			required: true,
			maxlength: [500, 'Summary must be less than 500 characters'],
		},
		content: {
			type: String,
			required: true,
			maxlength: [5242880, 'Content must be less than 5MB'],
		},
		cover: {
			type: String,
			required: true,
		},
		author: { type: Schema.Types.ObjectId, ref: 'User' },
	},
	{
		timestamps: true,
	},
);

export const Post = mongoose.model('Post', postSchema);
