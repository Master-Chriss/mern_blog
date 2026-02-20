import express from 'express';
import {
	register,
	login,
	fetchProfile,
	logout,
	getAllUsers,
	updateUserRole,
	deleteUser,
	getStats
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', fetchProfile);
router.post('/logout', logout);

// Admin Dashboard Routes (Admin Only)
router.get('/users', getAllUsers);
router.put('/user/:id', updateUserRole);
router.delete('/user/:id', deleteUser);
router.get('/stats', getStats);

export default router;
