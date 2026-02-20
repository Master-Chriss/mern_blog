import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DB_URL;

const connectToDB = async (dbUrl) => {
	try {
		await mongoose.connect(dbUrl);
		console.log('Server successfully connected to DB 😂😸😂');
	} catch (error) {
		console.log(error, 'Server Failed to connect ⚠👀⚠');
	}
};

export default connectToDB;
