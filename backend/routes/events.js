import express from 'express';
import Event from '../models/Event.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @description: Get events with optional geolocation filtering
 */
router.get('/', async (req, res) => {
    try {
        const { 
            search, 
            category, 
            date, 
            lat, 
            lng, 
            radius = 50
        } = req.query;

        let query = { status: 'published' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.name': { $regex: search, $options: 'i' } },
                { 'location.address.city': { $regex: search, $options: 'i' } },
                { 'location.address.street': { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (date) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            switch (date) {
                case 'today':
                    query.date = {
                        $gte: new Date(now.setHours(0, 0, 0, 0)),
                        $lt: new Date(now.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'tomorrow':
                    query.date = {
                        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
                        $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'week':
                    query.date = {
                        $gte: now,
                        $lt: nextWeek
                    };
                    break;
                case 'month':
                    query.date = {
                        $gte: now,
                        $lt: nextMonth
                    };
                    break;
            }
        }

        if (lat && lng) {
            console.log('Geolocation-Abfrage:', { lat, lng, radius });
            try {
                query['location.coordinates'] = {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: radius * 1000
                    }
                };
                console.log('Geolocation-Query:', JSON.stringify(query['location.coordinates']));
            } catch (error) {
                console.error('Fehler bei der Geolocation-Query:', error);
                delete query['location.coordinates'];
            }
        }

        console.log('Finale Query:', JSON.stringify(query));
        const events = await Event.find(query)
            .sort({ date: 1 })
            .populate('organizer', 'firstName lastName')
            .populate('location', 'name address city coordinates');
        console.log(`${events.length} Events gefunden`);

        res.json(events);
    } catch (err) {
        console.error('Fehler beim Abrufen der Events:', err);
        res.status(500).json({ 
            message: 'Fehler beim Abrufen der Events',
            error: err.message 
        });
    }
});

/**
 * @description: Get all events of a user (organized and participated)
 */
router.get('/my-events', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const organizedEvents = await Event.find({ organizer: userId })
            .sort({ date: 1 })
            .populate('location', 'name address city');

        const participatingEvents = await Event.find({ 
            participants: userId,
            organizer: { $ne: userId }
        })
            .sort({ date: 1 })
            .populate('organizer', 'firstName lastName')
            .populate('location', 'name address city');

        res.json({
            organized: organizedEvents,
            participating: participatingEvents
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Abrufen der Benutzer-Events',
            error: err.message 
        });
    }
});

/**
 * @description: Create a new event
 */
router.post('/', auth, async (req, res) => {
    try {
        if (req.body.location?.coordinates) {
            const { lat, lng } = req.body.location.coordinates;
            req.body.location.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        const eventData = {
            ...req.body,
            organizer: req.user._id,
            status: 'draft'
        };
        
        const event = new Event(eventData);
        const savedEvent = await event.save();
        
        await savedEvent.populate('organizer', 'firstName lastName');
        await savedEvent.populate('location', 'name address city');
        
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ 
            message: 'Fehler beim Erstellen des Events',
            error: err.message 
        });
    }
});

/**
 * @description: Get a specific event by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'firstName lastName')
            .populate('location', 'name address city')
            .populate('participants', 'firstName lastName');

        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }

        const isAccessible = 
            event.status === 'published' || 
            event.isPublic || 
            (req.user && req.user._id.toString() === event.organizer._id.toString());

        if (!isAccessible) {
            return res.status(403).json({ message: 'Keine Berechtigung für dieses Event' });
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Abrufen des Events',
            error: err.message 
        });
    }
});

/**
 * @description: Update an event
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Keine Berechtigung zum Bearbeiten dieses Events' });
        }

        const allowedUpdates = [
            'title',
            'description',
            'date',
            'endDate',
            'location',
            'maxParticipants',
            'status',
            'category',
            'imageUrl',
            'tags',
            'isPublic'
        ];

        const invalidFields = Object.keys(req.body).filter(key => !allowedUpdates.includes(key));
        if (invalidFields.length > 0) {
            return res.status(400).json({
                message: 'Ungültige Felder in der Anfrage',
                invalidFields,
                allowedFields: allowedUpdates
            });
        }

        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        if (updates.location?.coordinates) {
            const { lat, lng } = updates.location.coordinates;
            updates.location.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        Object.assign(event, updates);
        const updatedEvent = await event.save();
        
        await updatedEvent.populate('organizer', 'firstName lastName');
        await updatedEvent.populate('location', 'name address city');
        await updatedEvent.populate('participants', 'firstName lastName');
        
        res.json(updatedEvent);
    } catch (err) {
        console.error('Fehler beim Event-Update:', err);
        res.status(400).json({ 
            message: 'Fehler beim Aktualisieren des Events',
            error: err.message,
            details: err.errors || null
        });
    }
});

/**
 * @description: Delete an event
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Keine Berechtigung zum Löschen dieses Events' });
        }

        await event.deleteOne();
        res.json({ message: 'Event erfolgreich gelöscht' });
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Löschen des Events',
            error: err.message 
        });
    }
});

/**
 * @description: Participate in an event
 */
router.post('/:id/participate', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }

        if (event.status !== 'published') {
            return res.status(400).json({ message: 'Event ist nicht für Teilnahmen geöffnet' });
        }

        if (event.organizer.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Organisatoren können nicht an eigenen Events teilnehmen' });
        }

        if (event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: 'Sie nehmen bereits an diesem Event teil' });
        }

        if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event ist bereits ausgebucht' });
        }

        event.participants.push(req.user._id);
        await event.save();
        
        await event.populate('organizer', 'firstName lastName');
        await event.populate('location', 'name address city');
        await event.populate('participants', 'firstName lastName');
        
        res.json(event);
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler bei der Event-Teilnahme',
            error: err.message 
        });
    }
});

/**
 * @description: Cancel participation in an event
 */
router.delete('/:id/participate', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event nicht gefunden' });
        }

        if (!event.participants.includes(req.user._id)) {
            return res.status(400).json({ message: 'Sie nehmen nicht an diesem Event teil' });
        }

        event.participants = event.participants.filter(
            participantId => participantId.toString() !== req.user._id.toString()
        );
        
        await event.save();
        
        await event.populate('organizer', 'firstName lastName');
        await event.populate('location', 'name address city');
        await event.populate('participants', 'firstName lastName');
        
        res.json(event);
    } catch (err) {
        res.status(500).json({ 
            message: 'Fehler beim Stornieren der Teilnahme',
            error: err.message 
        });
    }
});

export default router; 