import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectToDB from './db/connectDB.js';

// Route Imports
import authRoutes from './routes/authRoute.js';
import postRoutes from './routes/postRoute.js';

const app = express();
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(
	cors({
		credentials: true,
		origin: ['http://localhost:5173', 'https://mernblog-frontend-rosy.vercel.app'],
	}),
);
app.use(express.json());
app.use(cookieParser());

// NOTE: No more '/uploads' static middleware needed!
// Cloudinary handles all image serving now

// Use Routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);

// Central error handler so API errors return JSON (including multer/cloudinary failures)
app.use((err, req, res, next) => {
	console.error('Unhandled API error:', err);
	const status = err?.status || err?.statusCode || 500;
	let message = 'Internal server error';
	if (typeof err === 'string') message = err;
	else if (err?.message) message = err.message;
	else if (err && typeof err === 'object') message = JSON.stringify(err);
	res.status(status).json({ message });
});

connectToDB(DB_URL);

app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));
