import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @description: This is the middleware to verify the JWT.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @returns {Promise<void>} - A promise that resolves when the user is authenticated.
 * @throws {Error} - An error if the user is not authenticated.
 */
export const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Benutzer nicht gefunden' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Ungültiger Token' });
        }
        console.error('Auth-Middleware Fehler:', err);
        res.status(500).json({ 
            error: 'Fehler bei der Authentifizierung',
            details: err.message
        });
    }
};

/**
 * @description: This is the middleware to verify the admin role.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function.
 * @returns {Promise<void>} - A promise that resolves when the user is authenticated.
 * @throws {Error} - An error if the user is not authenticated.
 */
export const admin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    next();
}; 