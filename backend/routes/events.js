import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

/**
 * @description: This is the GET route for the events. It is used to get all events.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the events are fetched.
 */
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Abrufen der Events',
            error: err.message 
        });
    }
});

/**
 * @description: This is the POST route for the events. It is used to create a new event.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the event is created.
 */
router.post('/', async (req, res) => {
    try {
        const event = new Event(req.body);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ 
            message: 'Fehler beim Erstellen des Events',
            error: err.message 
        });
    }
});

/**
 * @description: This is the GET route for the event by id. It is used to get an event by id.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the event is fetched.
 */
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Abrufen des Events',
            error: err.message 
        });
    }
});

export default router; 