import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Ein Titel ist erforderlich'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Ein Datum ist erforderlich']
    },
    location: {
        type: String,
        required: [true, 'Ein Ort ist erforderlich'],
        trim: true
    },
    maxParticipants: {
        type: Number,
        min: 1
    },
    participants: [{
        name: String,
        email: String,
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event; 