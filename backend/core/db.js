import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB Verbindungsfehler:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB Verbindung getrennt');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (err) {
        console.error("MongoDB Verbindungsfehler:", err);
        throw err;
    }
}

export default connectDB;