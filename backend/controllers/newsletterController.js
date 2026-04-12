import Newsletter from '../models/Newsletter.js';

export const subscribeNewsletter = async (req, res) => {
	try {
		const { email } = req.body;

		console.log('📧 Newsletter subscription attempt:', email);

		// Validate email
		if (!email || !email.trim()) {
			console.log('❌ Email is empty');
			return res.status(400).json({ message: 'Email is required' });
		}

		const cleanEmail = email.trim().toLowerCase();

		// Check if already subscribed
		const existingSubscriber = await Newsletter.findOne({ email: cleanEmail });

		if (existingSubscriber) {
			if (existingSubscriber.isActive) {
				console.log('❌ Email already subscribed:', cleanEmail);
				return res
					.status(400)
					.json({ message: 'This email is already subscribed' });
			}
			// Reactivate if previously unsubscribed
			console.log('♻️ Reactivating email:', cleanEmail);
			existingSubscriber.isActive = true;
			existingSubscriber.subscribedAt = new Date();
			await existingSubscriber.save();
			return res.status(200).json({
				message: 'Resubscribed successfully!',
				subscriber: existingSubscriber,
			});
		}

		// Create new newsletter subscriber
		console.log('✅ Creating new subscriber:', cleanEmail);
		const newSubscriber = new Newsletter({ email: cleanEmail });
		await newSubscriber.save();

		console.log('✅ Successfully subscribed:', cleanEmail);
		res.status(201).json({
			message: 'Successfully subscribed to our newsletter!',
			subscriber: newSubscriber,
		});
	} catch (error) {
		console.error('❌ Newsletter subscription error:', error);
		console.error('Error name:', error.name);
		console.error('Error code:', error.code);
		console.error('Error message:', error.message);

		// Handle duplicate key error
		if (error.code === 11000 || error.name === 'MongoServerError') {
			console.log('Duplicate key detected');
			return res
				.status(400)
				.json({ message: 'This email is already subscribed' });
		}

		// Handle validation error
		if (error.name === 'ValidationError') {
			const messages = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({ message: messages.join(', ') });
		}

		res.status(500).json({
			message: 'Error subscribing to newsletter',
			error: error.message,
		});
	}
};

export const unsubscribeNewsletter = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email || !email.trim()) {
			return res.status(400).json({ message: 'Email is required' });
		}

		const subscriber = await Newsletter.findOneAndUpdate(
			{ email: email.toLowerCase() },
			{ isActive: false },
			{ new: true },
		);

		if (!subscriber) {
			return res.status(404).json({ message: 'Email not found' });
		}

		res.status(200).json({ message: 'Unsubscribed successfully', subscriber });
	} catch (error) {
		console.error('Newsletter unsubscribe error:', error);
		res.status(500).json({
			message: 'Error unsubscribing from newsletter',
			error: error.message,
		});
	}
};

export const getNewsletterStats = async (req, res) => {
	try {
		const totalSubscribers = await Newsletter.countDocuments({
			isActive: true,
		});
		const totalEmails = await Newsletter.countDocuments();

		res.status(200).json({
			activeSubscribers: totalSubscribers,
			totalEmails,
		});
	} catch (error) {
		console.error('Error fetching newsletter stats:', error);
		res
			.status(500)
			.json({ message: 'Error fetching stats', error: error.message });
	}
};
