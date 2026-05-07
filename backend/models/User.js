import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, min: 3 },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, unique: true, min: 4 },
	role: {
		type: String,
		enum: ['admin', 'author', 'reader'],
		default: 'reader',
	},
}, { timestamps: true });

userSchema.index({ username: 'text', email: 'text', unique: true }); // Index for efficient search by username or email
export const User = mongoose.model('User', userSchema);
