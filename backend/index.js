import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectToDB from './db/connectDB.js';

// Route Imports
import authRoutes from './routes/authRoute.js';
import postRoutes from './routes/postRoute.js';
import newsletterRoutes from './routes/newsletterRoute.js';
import commentRoutes from './routes/commentRoute.js';

const app = express();
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(
	cors({
		credentials: true,
		origin: ['http://localhost:5173', 'https://new-gen-latest-news.vercel.app'],
	}),
);

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// Use Routes
app.use('/auth', authRoutes);
app.use('/post', postRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/comments', commentRoutes);

// Central error handler so API errors return JSON (including cloudinary failures)
app.use((err, req, res, next) => {
	console.error('Unhandled API error:', err);
	const status = err?.status || err?.statusCode || 500;
	let message = 'Internal server error';
	if (typeof err === 'string') message = err;
	else if (err?.message) message = err.message;
	else if (err && typeof err === 'object') message = JSON.stringify(err);
	res.status(status).json({ message });
});


app.listen(port, (err) => {
	if(err) return console.error('Failed to start server:', err);
	// connect to DB first, then start server to avoid accepting requests before DB is ready
	connectToDB(DB_URL);
	console.log(`🚀 Server running on port: ${port}`)
});
