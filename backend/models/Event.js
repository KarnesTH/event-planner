import mongoose from 'mongoose'

/**
 * @description: This is the event schema. It is used to create a new event.
 * @returns {Object} - A mongoose schema object.
 */
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        name: {
            type: String,
            required: true
        },
        address: {
            street: String,
            city: String,
            postalCode: String,
            country: String
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['Konzert', 'Workshop', 'Networking', 'Sport', 'Kultur', 'Andere']
    },
    imageUrl: {
        type: String,
        default: '/placeholder-event.jpg'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxParticipants: {
        type: Number,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

export default Event; 