import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @description: Health check endpoint
 */
router.get('/', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const isDbConnected = dbState === 1;

        if (!isDbConnected) {
            return res.status(503).json({
                status: 'error',
                message: 'Datenbank nicht verbunden',
                dbState
            });
        }

        res.json({
            status: 'ok',
            message: 'Service ist gesund',
            timestamp: new Date().toISOString(),
            dbState
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Service ist nicht gesund',
            error: err.message
        });
    }
});

export default router; 