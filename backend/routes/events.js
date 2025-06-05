import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

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