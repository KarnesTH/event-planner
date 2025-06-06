import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

/**
 * @description: This is the mock event class. It is used to mock the event class.
 * @returns {Object} - A Jest mock event class.
 */
class MockEvent {
    constructor(data) {
        this.data = data;
    }

    save() {
        return mockStaticMethods.save();
    }
}

/**
 * @description: This is the mock static methods. It is used to mock the static methods of the event class.
 */
const mockStaticMethods = {
    find: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockResolvedValue([])
    })),
    findById: jest.fn(),
    save: jest.fn()
};

Object.assign(MockEvent, mockStaticMethods);

const mockEventModule = {
    default: MockEvent
};

await jest.unstable_mockModule('../../models/Event.js', () => mockEventModule);

const { default: eventRoutes } = await import('../../routes/events.js');

const app = express();
app.use(express.json());
app.use('/api/events', eventRoutes);

/**
 * @description: This is the test suite for the event routes.
 * @returns {Object} - A Jest test suite object.
 */
describe('Event Routes', () => {
    const testEvent = {
        title: 'Test Event',
        description: 'Test Beschreibung',
        date: new Date('2024-12-31'),
        location: 'Test Location',
        maxParticipants: 10
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockStaticMethods.find.mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue([])
        }));
        mockStaticMethods.findById.mockResolvedValue(null);
        mockStaticMethods.save.mockResolvedValue(null);
    });

    /**
     * @description: This is the test suite for the POST /api/events route.
     * @returns {Object} - A Jest test suite object.
     */
    describe('POST /api/events', () => {
        /**
         * @description: This is the test for the POST /api/events route. It should return a 201 status code and a JSON object with the event.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte ein neues Event erstellen', async () => {
            const savedEvent = { ...testEvent, _id: '123' };
            mockStaticMethods.save.mockResolvedValueOnce(savedEvent);

            const response = await request(app)
                .post('/api/events')
                .send(testEvent)
                .expect(201);

            expect(response.body).toHaveProperty('_id', '123');
            expect(response.body.title).toBe(testEvent.title);
            expect(mockStaticMethods.save).toHaveBeenCalled();
        });

        /**
         * @description: This is the test for the POST /api/events route. It should return a 400 status code and a JSON object with the error message.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte einen Fehler werfen bei fehlenden Pflichtfeldern', async () => {
            const invalidEvent = { ...testEvent };
            delete invalidEvent.title;

            mockStaticMethods.save.mockRejectedValueOnce(new Error('Validation failed'));

            const response = await request(app)
                .post('/api/events')
                .send(invalidEvent)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Fehler beim Erstellen des Events');
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * @description: This is the test suite for the GET /api/events route.
     * @returns {Object} - A Jest test suite object.
     */
    describe('GET /api/events', () => {
        /**
         * @description: This is the test for the GET /api/events route. It should return a 200 status code and a JSON object with the events.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte alle Events zurückgeben', async () => {
            const events = [{ ...testEvent, _id: '123' }];
            mockStaticMethods.find.mockImplementationOnce(() => ({
                sort: jest.fn().mockResolvedValueOnce(events)
            }));

            const response = await request(app)
                .get('/api/events')
                .expect(200);

            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('title', testEvent.title);
            expect(mockStaticMethods.find).toHaveBeenCalled();
        });

        /**
         * @description: This is the test for the GET /api/events route. It should return a 500 status code and a JSON object with the error message.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte einen Datenbankfehler korrekt behandeln', async () => {
            mockStaticMethods.find.mockImplementationOnce(() => ({
                sort: jest.fn().mockRejectedValueOnce(new Error('Database error'))
            }));

            const response = await request(app)
                .get('/api/events')
                .expect(500);

            expect(response.body).toHaveProperty('message', 'Fehler beim Abrufen der Events');
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * @description: This is the test suite for the GET /api/events/:id route.
     * @returns {Object} - A Jest test suite object.
     */
    describe('GET /api/events/:id', () => {
        /**
         * @description: This is the test for the GET /api/events/:id route. It should return a 200 status code and a JSON object with the event.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte ein spezifisches Event zurückgeben', async () => {
            const event = { ...testEvent, _id: '123' };
            mockStaticMethods.findById.mockResolvedValueOnce(event);

            const response = await request(app)
                .get('/api/events/123')
                .expect(200);

            expect(response.body).toHaveProperty('_id', '123');
            expect(response.body.title).toBe(testEvent.title);
            expect(mockStaticMethods.findById).toHaveBeenCalledWith('123');
        });

        /**
         * @description: This is the test for the GET /api/events/:id route. It should return a 404 status code and a JSON object with the error message.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte 404 zurückgeben für nicht existierendes Event', async () => {
            mockStaticMethods.findById.mockResolvedValueOnce(null);

            const response = await request(app)
                .get('/api/events/123')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Event nicht gefunden');
        });

        /**
         * @description: This is the test for the GET /api/events/:id route. It should return a 500 status code and a JSON object with the error message.
         * @returns {Promise<void>} - A promise that resolves when the test is complete.
         * @throws {Error} - An error if the test fails.
         */
        it('sollte einen Datenbankfehler korrekt behandeln', async () => {
            mockStaticMethods.findById.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/api/events/123')
                .expect(500);

            expect(response.body).toHaveProperty('message', 'Fehler beim Abrufen des Events');
            expect(response.body).toHaveProperty('error');
        });
    });
}); 