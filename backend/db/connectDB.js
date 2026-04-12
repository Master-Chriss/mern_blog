import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DB_URL;

const connectToDB = async (dbUrl) => {
	try {
		const conn = await mongoose.connect(dbUrl);
		console.log('Server successfully connected to DB 😂😸😂');
		console.log(conn.connection.host, 'DB Host');
	} catch (error) {
		console.log(error, 'Server Failed to connect ⚠👀⚠');
	}
};

export default connectToDB;
