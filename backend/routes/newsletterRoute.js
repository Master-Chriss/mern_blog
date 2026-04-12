import express from 'express';
import {
	subscribeNewsletter,
	unsubscribeNewsletter,
	getNewsletterStats,
} from '../controllers/newsletterController.js';

const router = express.Router();

// Subscribe to newsletter
router.post('/subscribe', subscribeNewsletter);

// Unsubscribe from newsletter
router.post('/unsubscribe', unsubscribeNewsletter);

// Get newsletter statistics (for admin dashboard)
router.get('/stats', getNewsletterStats);

export default router;
