import mongoose from 'mongoose';
import Event from '../models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Update the event coordinates
 */
const updateEventCoordinates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB verbunden');

        const events = await Event.find({
            'location.coordinates.lat': { $exists: true },
            'location.coordinates.lng': { $exists: true }
        });

        console.log(`${events.length} Events gefunden, die aktualisiert werden müssen`);

        for (const event of events) {
            const { lat, lng } = event.location.coordinates;
            event.location.coordinates = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
            await event.save();
            console.log(`Event ${event._id} aktualisiert`);
        }

        console.log('Alle Events wurden erfolgreich aktualisiert');
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Events:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Verbindung geschlossen');
    }
};

updateEventCoordinates(); 