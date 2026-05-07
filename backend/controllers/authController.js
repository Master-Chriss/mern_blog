import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const salt = await bcrypt.genSalt(10);
const secret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

const getTokenCookieOptions = () => ({
	httpOnly: true,
	sameSite: isProduction ? 'none' : 'lax',
	secure: isProduction,
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeUsername = (value = '') => value.trim().toLowerCase();
const normalizeEmail = (value = '') => value.trim().toLowerCase();

export const register = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const normalizedUsername = normalizeUsername(username);
		const normalizedEmail = normalizeEmail(email);
		const normalizedPassword = password?.trim();

		// validation
		if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Check if user exists
		const emailExists = await User.findOne({
			email: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i'),
		});
		if (emailExists) {
			return res.status(400).json({ message: 'Email already registered' });
		}

		const usernameExists = await User.findOne({
			username: new RegExp(`^${escapeRegex(normalizedUsername)}$`, 'i'),
		});
		if (usernameExists) {
			return res.status(400).json({ message: 'Username already taken' });
		}

		const hashedPassword = await bcrypt.hash(normalizedPassword, salt);
		
		const newUser = await User.create({
			username: normalizedUsername,
			email: normalizedEmail,
			password: hashedPassword,
			role: 'reader',
		});
		res.status(201).json({
			id: newUser._id,
			username: newUser.username,
			role: newUser.role,
		});
	} catch (err) {
		console.log("Error in register controller.", err.message)
		res.status(400).json({message: "Internal server error", error: err.message});
	}
};

export const login = async (req, res) => {
	const { username, password } = req.body;
	try {
		const normalizedUsername = normalizeUsername(username);
		const normalizedPassword = password?.trim();

		if(!normalizedUsername || !normalizedPassword) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		const user = await User.findOne({
			username: new RegExp(`^${escapeRegex(normalizedUsername)}$`, 'i'),
		});

	if (!user || !bcrypt.compareSync(normalizedPassword, user.password)) {
			return res.status(400).json({ message: 'Wrong credentials' });
		}

	jwt.sign(
		{ username: user.username, id: user._id, role: user.role },
		secret,
		{},
		(err, token) => {
				if (err) return res.status(500).json({ message: 'Error generating token', error: err.message });
				res
					.cookie('token', token, getTokenCookieOptions())
					.json({
						id: user._id,
						username: user.username,
					role: user.role,
				});
		},
	);
	} catch (error) {
		console.log("Error in login controller.", error.message)
		return res.status(500).json({message: 'Server error', error: error.message});
	}
	
};

export const fetchProfile = (req, res) => {
	const { token } = req.cookies;
	if (!token) return res.json(null);

	jwt.verify(token, secret, {}, (err, info) => {
		if (err) return res.status(401).json('Unauthorized');
		res.json({
			id: info.id,
			username: info.username,
			role: info.role,
		});
	});
};

export const logout = (req, res) => {
	try {
		const { token } = req.cookies;
		if (!token) return res.status(400).json('No token found');

		res.clearCookie('token', getTokenCookieOptions()).json('ok');
		
	} catch (error) {
		console.log("Error in logout controller")
		return res.status(500).json({message: 'Server error', error: error.message});
	}
};


// ADMIN CONTROLLERS
// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['reader', 'author', 'admin'];
  if (!validRoles.includes(role)) return res.status(400).json('Invalid role');

  try {
    await User.findByIdAndUpdate(id, { role });
    res.json({ message: `User role updated to ${role}}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json('User deleted');
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get blog stats (admin only)
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAuthors, totalReaders, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'author' }),
      User.countDocuments({ role: 'reader' }),
      User.countDocuments({ role: 'admin' }),
    ]);
    res.json({ totalUsers, totalAuthors, totalReaders, totalAdmins });
  } catch (error) {
    res.status(500).json({message: 'Error fetching stats'});
  }
};
