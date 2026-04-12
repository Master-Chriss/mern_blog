import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			sparse: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
		},
		subscribedAt: {
			type: Date,
			default: Date.now,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

export default mongoose.model('Newsletter', newsletterSchema);
