import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import eventRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());

/**
 * Routes
 */
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);

/**
 * Static Files
 */
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

/**
 * Root Route
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Server läuft',
        status: 'success',
        version: '1.0.0',
        db: mongoose.connection.readyState === 1 ? 'verbunden' : 'getrennt',
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasJwtSecret: !!process.env.JWT_SECRET,
            nodeEnv: process.env.NODE_ENV
        }
    });
});

/**
 * Error Handling Middleware
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next function
 */
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Interner Serverfehler',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

/**
 * @description: This is the function to connect to the database.
 * @returns {Promise<void>} - A promise that resolves when the connection is established.
 * @throws {Error} - An error if the connection fails.
 */
const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error('MONGO_URI ist nicht definiert in der .env Datei');
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('MongoDB verbunden');
    } catch (err) {
        console.error('MongoDB Verbindungsfehler:', err);
        throw err;
    }
};

/**
 * @description: This is the function to start the server.
 * @returns {Promise<void>} - A promise that resolves when the server is started.
 * @throws {Error} - An error if the server fails to start.
 */
const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET ist nicht definiert in der .env Datei');
        }

        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server läuft auf http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Fehler beim Starten des Servers:', err);
        process.exit(1);
    }
};

/**
 * @description: This is the function to start the server. If the file is run directly (not imported), the server is started. 
 * @returns {Promise<void>} - A promise that resolves when the server is started.
 * @throws {Error} - An error if the server fails to start.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}

export { app, startServer }; 