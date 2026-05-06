import express from 'express';
import {
	register,
	login,
	fetchProfile,
	logout,
	getAllUsers,
	updateUserRole,
	deleteUser,
	getStats,
} from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', fetchProfile);
router.post('/logout', logout);

// Admin Dashboard Routes (Admin Only)
router.get('/users', verifyToken, requireAdmin, getAllUsers);
router.put('/user/:id', verifyToken, requireAdmin, updateUserRole);
router.delete('/user/:id', verifyToken, requireAdmin, deleteUser);
router.get('/stats', verifyToken, requireAdmin, getStats);

export default router;
