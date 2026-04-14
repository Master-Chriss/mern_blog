import mongoose from 'mongoose';
import {
	DEFAULT_POST_CATEGORY,
	POST_CATEGORIES,
} from '../constants/postCategories.js';
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
			category: {
				type: String,
				enum: POST_CATEGORIES,
				default: DEFAULT_POST_CATEGORY,
				required: true,
				trim: true,
			},
			tags: {
				type: [String],
				default: [],
				validate: {
					validator: (tags) => tags.length <= 8,
					message: 'A post can have at most 8 tags',
				},
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
