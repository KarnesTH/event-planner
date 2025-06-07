import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Event.js';

const router = express.Router();

/**
 * @description: This is the route to register a new user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is registered.
 * @throws {Error} - An error if the user is not registered.
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validiere erforderliche Felder
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                error: 'Alle Felder sind erforderlich' 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Ein Benutzer mit dieser Email existiert bereits' 
            });
        }

        const user = await User.create({ 
            email, 
            password, 
            firstName, 
            lastName 
        });
        
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registrierung erfolgreich',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Registrierungsfehler:', err);
        res.status(500).json({ 
            error: 'Fehler bei der Registrierung',
            details: err.message
        });
    }
});

/**
 * @description: This is the route to login a user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is logged in.
 * @throws {Error} - An error if the user is not logged in.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Ungültige Email oder Passwort' 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Ungültige Email oder Passwort' 
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login erfolgreich',
            token,
            user: user.toJSON()
        });
    } catch (err) {
        console.error('Login-Fehler:', err);
        res.status(500).json({ 
            error: 'Fehler beim Login',
            details: err.message
        });
    }
});

/**
 * @description: This is the route to get the current user with their events.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user and their events are returned.
 * @throws {Error} - An error if the user is not returned.
 */
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Hole Events des Benutzers (organisierte und teilgenommene)
        const [organizedEvents, participatingEvents] = await Promise.all([
            Event.find({ organizer: user._id })
                .sort({ date: 1 })
                .populate('organizer', 'firstName lastName email'),
            Event.find({ participants: user._id })
                .sort({ date: 1 })
                .populate('organizer', 'firstName lastName email')
        ]);

        res.json({
            user: user.toJSON(),
            events: {
                organized: organizedEvents,
                participating: participatingEvents
            }
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Ungültiger Token' });
        }
        console.error('Auth-Fehler:', err);
        res.status(500).json({ 
            error: 'Fehler bei der Authentifizierung',
            details: err.message
        });
    }
});

export default router; 