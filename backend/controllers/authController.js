import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;

export const register = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		// Check if user exists
		const emailExists = await User.findOne({ email });
		if (emailExists) {
			return res.status(400).json('Email already registered');
		}

		const usernameExists = await User.findOne({ username });
		if (usernameExists) {
			return res.status(400).json('Username already taken');
		}

		const newUser = await User.create({
			username,
			email,
			password: bcrypt.hashSync(password, salt),
			role: 'reader',
		});
		res.status(201).json({
			id: newUser._id,
			username: newUser.username,
			role: newUser.role,
		});
	} catch (err) {
		res.status(400).json({message: err.message, stack: err.stack});
	}
};

export const login = async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username });

	if (!user || !bcrypt.compareSync(password, user.password)) {
		return res.status(400).json('Wrong credentials');
	}

	jwt.sign(
		{ username: user.username, id: user._id, role: user.role },
		secret,
		{},
		(err, token) => {
			if (err) throw err;
			res.cookie('token', token, { httpOnly: true }).json({
				id: user._id,
				username: user.username,
				role: user.role,
			});
		},
	);
};

export const fetchProfile = (req, res) => {
	const { token } = req.cookies;
	if (!token) return res.json(null);

	jwt.verify(token, secret, {}, (err, info) => {
		if (err) throw err;
		res.json({
			id: info.id,
			username: info.username,
			role: info.role,
		});
	});
};

export const logout = (req, res) => {
	res.cookie('token', '').json('ok');
};

// TODO: Admin Dashboard Controllers
// Get all users (admin only)

export const getAllUsers = async (req, res) => {
  const { token } = req.cookies;
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');
    if (info.role !== 'admin') return res.status(403).json('Access denied');
    
    const users = await User.find().select('-password');
    res.json(users);
  });
};

// Update user role (admin only)
export const updateUserRole = async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.params;
  const { role } = req.body;
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');
    if (info.role !== 'admin') return res.status(403).json('Access denied');
    
    await User.findByIdAndUpdate(id, { role });
    res.json('Role updated');
  });
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  const { token } = req.cookies;
  const { id } = req.params;
  
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(401).json('Unauthorized');
    if (info.role !== 'admin') return res.status(403).json('Access denied');
    
    await User.findByIdAndDelete(id);
    res.json('User deleted');
  });
};

// Get blog stats (admin only)
export const getStats = async (req, res) => {
  const { token } = req.cookies;
  
  if (!token) return res.status(401).json('Not authenticated');

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) return res.status(403).json('Invalid token');
    
    // Check if admin
    if (info.role !== 'admin') {
      return res.status(403).json('Access denied: Admins only');
    }
    
    try {
      const totalUsers = await User.countDocuments();
      const totalAuthors = await User.countDocuments({ role: 'author' });
      const totalReaders = await User.countDocuments({ role: 'reader' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });
      
      res.json({
        totalUsers,
        totalAuthors,
        totalReaders,
        totalAdmins
      });
    } catch (error) {
      res.status(500).json('Error fetching stats');
    }
  });
};