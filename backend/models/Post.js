import mongoose from "mongoose";
const {Schema} = mongoose;

// Defining a post schema/blueprint
const postSchema = new mongoose.Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: {type: Schema.Types.ObjectId, ref:'User'}
}, {
    timestamps: true,
});

export const Post = mongoose.model('Post', postSchema);
