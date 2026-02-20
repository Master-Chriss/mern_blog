import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { Post } from '../models/Post.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/filename.jpg
    const urlParts = url.split('/');
    const filenameWithVersion = urlParts[urlParts.length - 1]; // v12345_filename.jpg
    const filename = filenameWithVersion.split('_').pop(); // filename.jpg
    const publicId = `blog-images/${filename.split('.')[0]}`; // blog-images/filename
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};


export const createPost = async (req, res) => {
	const { token } = req.cookies;

	jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
		if (err) return res.status(401).json({ message: 'Invalid token' });

		try {
			const { title, summary, content } = req.body;
			const imageUrl = req.file?.secure_url || req.file?.url || req.file?.path;

			// Check if file was uploaded
			if (!imageUrl) {
				return res.status(400).json({ message: 'No image file provided' });
			}

			const postDoc = await Post.create({
				title,
				summary,
				content,
				cover: imageUrl,
				author: info.id,
			});

			res.status(201).json(postDoc);
		} catch (error) {
			console.error('Error creating post:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});
};

export const getPosts = async (req, res) => {
	const posts = await Post.find()
		.populate('author', ['username'])
		.sort({ createdAt: -1 })
		.limit(20);
	res.json(posts);
};

export const getSinglePost = async (req, res) => {
	const { id } = req.params;
	const postDoc = await Post.findById(id).populate('author', ['username']);
	res.json(postDoc);
};

export const updatePost = async (req, res) => {
	const { token } = req.cookies;

	jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
		if (err) return res.status(401).json({ message: 'Invalid token' });

		try {
			const { id, title, summary, content } = req.body;
			const postId = req.params.id || id;
			const postDoc = await Post.findById(postId);

			if (!postDoc) {
				return res.status(404).json({ message: 'Post not found' });
			}

			// Check permissions
			const isAuthor = postDoc.author.equals(info.id);
			const isAdmin = info.role === 'admin';

			if (!isAuthor && !isAdmin) {
				return res.status(403).json({ message: 'Not authorized' });
			}

			// Prepare update data
			const updateData = { title, summary, content };

			// If new image uploaded, handle old image deletion and new image URL
			if (req.file) {
				const newImageUrl = req.file?.secure_url || req.file?.url || req.file?.path;

				if (!newImageUrl) {
					return res.status(400).json({ message: 'Uploaded image URL missing' });
				}

				// Delete old image from Cloudinary if it exists
				if (postDoc.cover && postDoc.cover.includes('cloudinary')) {
					const oldPublicId = extractPublicIdFromUrl(postDoc.cover);
					if (oldPublicId) {
						await cloudinary.v2.uploader.destroy(oldPublicId, (err, result) => {
							if (err) console.error('Error deleting old image:', err);
							else console.log('Old image deleted from Cloudinary:', result);
						});
					}
				}

				// Set new image URL
				updateData.cover = newImageUrl;
			}

			await postDoc.updateOne(updateData);
			res.json({ message: 'Post updated successfully', post: updateData });
		} catch (error) {
			console.error('Error updating post:', error);
			res.status(500).json({ message: 'Server error' });
		}
	});
};

const secret = process.env.JWT_SECRET;

// Delete a post

export const deletePost = async (req, res) => {
	const { id } = req.params;
	const { token } = req.cookies;

	if (!token) return res.status(401).json('Not authenticated');

	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) return res.status(403).json('Token invalid');

		try {
			// 1. Find the post first (don't delete it yet!)
			const postDoc = await Post.findById(id);
			if (!postDoc) return res.status(404).json('Post not found');

			// 2. Logic: Is the user the author OR an admin?
			const isAuthor = postDoc.author.equals(info.id);
			const isAdmin = info.role === 'admin';

			if (!isAuthor && !isAdmin) {
				return res
					.status(403)
					.json('You do not have permission to delete this');
			}

			// 3. Delete the image from Cloudinary
			if (postDoc.cover && postDoc.cover.includes('cloudinary')) {
				const publicId = extractPublicIdFromUrl(postDoc.cover);
				if (publicId) {
					const result = await cloudinary.v2.uploader.destroy(publicId);
					console.log('Image deleted from Cloudinary:', result);

					// Optional: check if deletion was successful
					if (result.result !== 'ok') {
						console.warn('Image may not have been deleted properly');
						// Still continue with post deletion? Your call.
					}
				}
			}

			// 4. DELETE THE DATABASE ENTRY
			await Post.findByIdAndDelete(id);

			res.json({ message: 'Post and image deleted successfully' });
		} catch (error) {
			console.error(error);
			res.status(500).json('Error deleting post');
		}
	});
};



// ! OPTIONAL ADMIN DASHBOARD CONTROLLERS
export const cleanupOrphanedImages = async (req, res) => {
	const { token } = req.cookies;

	jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
		if (err) return res.status(401).json({ message: 'Invalid token' });
		if (info.role !== 'admin') {
			return res.status(403).json({ message: 'Admins only' });
		}

		try {
			console.log('Starting orphaned images cleanup...');

			// 1. Get all Cloudinary images from your blog-images folder
			const cloudinaryImages = await cloudinary.v2.api.resources({
				type: 'upload',
				prefix: 'blog-images/', // Only look in your blog folder
				max_results: 500, // Adjust based on your needs
			});

			if (
				!cloudinaryImages.resources ||
				cloudinaryImages.resources.length === 0
			) {
				return res.json({ message: 'No images found in Cloudinary' });
			}

			console.log(
				`Found ${cloudinaryImages.resources.length} images in Cloudinary`,
			);

			// 2. Get all posts from database to extract their cover URLs
			const allPosts = await Post.find({}, 'cover');
			const usedImageUrls = new Set(allPosts.map((post) => post.cover));

			// 3. Track results
			const orphanedImages = [];
			const deletedImages = [];
			const errors = [];

			// 4. Check each Cloudinary image
			for (const image of cloudinaryImages.resources) {
				const imageUrl = image.secure_url;

				// If this image URL is not used by any post, it's orphaned
				if (!usedImageUrls.has(imageUrl)) {
					orphanedImages.push({
						public_id: image.public_id,
						url: imageUrl,
						created_at: image.created_at,
					});

					try {
						// Delete the orphaned image
						const result = await cloudinary.v2.uploader.destroy(
							image.public_id,
						);

						if (result.result === 'ok') {
							deletedImages.push(image.public_id);
							console.log(`Deleted orphaned image: ${image.public_id}`);
						} else {
							errors.push({ public_id: image.public_id, error: result.result });
						}
					} catch (deleteError) {
						errors.push({
							public_id: image.public_id,
							error: deleteError.message,
						});
					}
				}
			}

			// 5. Return comprehensive report
			res.json({
				message: 'Cleanup completed',
				stats: {
					totalCloudinaryImages: cloudinaryImages.resources.length,
					orphanedFound: orphanedImages.length,
					successfullyDeleted: deletedImages.length,
					errors: errors.length,
				},
				details: {
					orphanedImages: orphanedImages.slice(0, 10), // First 10 for preview
					deletedImages: deletedImages.slice(0, 10), // First 10 deleted
					errors: errors,
				},
				summary: `${deletedImages.length} orphaned images deleted successfully`,
			});
		} catch (error) {
			console.error('Error during cleanup:', error);
			res.status(500).json({
				message: 'Error during cleanup',
				error: error.message,
			});
		}
	});
};

// Optional: Preview orphaned images without deleting
export const previewOrphanedImages = async (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    if (info.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    try {
      // Get all Cloudinary images
      const cloudinaryImages = await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: 'blog-images/',
        max_results: 500
      });

      // Get all posts
      const allPosts = await Post.find({}, 'cover');
      const usedImageUrls = new Set(allPosts.map(post => post.cover));

      // Find orphaned images
      const orphanedImages = cloudinaryImages.resources
        .filter(image => !usedImageUrls.has(image.secure_url))
        .map(image => ({
          public_id: image.public_id,
          url: image.secure_url,
          created_at: image.created_at,
          size: image.bytes
        }));

      res.json({
        totalCloudinaryImages: cloudinaryImages.resources.length,
        orphanedCount: orphanedImages.length,
        orphanedImages: orphanedImages.slice(0, 20), // Preview first 20
        totalSize: orphanedImages.reduce((acc, img) => acc + img.size, 0)
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Optional: Delete a specific image by URL or public_id
export const deleteSpecificImage = async (req, res) => {
  const { token } = req.cookies;
  const { public_id, url } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, info) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    if (info.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    try {
      let publicId = public_id;
      
      // If URL provided instead of public_id, extract it
      if (url && !public_id) {
        const extractedId = extractPublicIdFromUrl(url);
        if (!extractedId) {
          return res.status(400).json({ message: 'Could not extract public_id from URL' });
        }
        publicId = extractedId;
      }

      if (!publicId) {
        return res.status(400).json({ message: 'public_id or URL required' });
      }

      const result = await cloudinary.v2.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        res.json({ message: 'Image deleted successfully', public_id: publicId });
      } else {
        res.status(404).json({ message: 'Image not found or already deleted' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
