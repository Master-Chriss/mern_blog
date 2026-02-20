import 'dotenv/config';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
	const { token } = req.cookies;
	if (!token) return res.status(401).json({ message: 'Not logged in' });

	jwt.verify(token, secret, {}, (err, info) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });
		req.user = info; // Attach user info to the request
		next(); // Move to the next function (the controller)
	});
};
