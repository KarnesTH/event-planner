import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import eventRoutes from './routes/events.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/events', eventRoutes);

// Root Route
app.get('/', (req, res) => {
    res.json({
        message: 'Server läuft',
        status: 'success',
        version: '1.0.0',
        db: mongoose.connection.readyState === 1 ? 'verbunden' : 'getrennt'
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
        throw new Error('MONGO_URI ist nicht definiert');
    }

    try {
        await mongoose.connect(MONGO_URI);
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
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server läuft auf http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Fehler beim Starten des Servers:', err);
        throw err;
    }
};


if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}

export { app, startServer }; 