import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * @description: Verbindet mit der MongoDB-Datenbank
 * @returns {Promise<void>} - Promise das aufgelöst wird, wenn die Verbindung steht
 * @throws {Error} - Fehler wenn MONGO_URI nicht definiert ist oder die Verbindung fehlschlägt
 */
const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
        throw new Error('MONGO_URI ist nicht definiert');
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
    } catch (err) {
        console.error("MongoDB Verbindungsfehler:", err);
        throw err;
    }
}

export default connectDB;