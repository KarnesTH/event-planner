import request from 'supertest';
import { app } from '../server.js';

describe('Express App', () => {
    /**
     * @description: This is the test for the Root-Route. It should return a 200 status code and a JSON object with the server status.
     * @returns {Promise<void>} - A promise that resolves when the test is complete.
     * @throws {Error} - An error if the test fails.
     */
    it('sollte die Root-Route korrekt bedienen', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);
        
        expect(response.body).toEqual({
            message: 'Server läuft',
            status: 'success',
            version: '1.0.0',
            db: expect.any(String)
        });
    });

    /**
     * @description: This is the test for the Event-Route. It should return a 200 status code and an array of events.
     * @returns {Promise<void>} - A promise that resolves when the test is complete.
     * @throws {Error} - An error if the test fails.
     */
    it('sollte die Event-Route korrekt bedienen', async () => {
        const response = await request(app)
            .get('/api/v1/events')
            .expect(200);
        
        expect(Array.isArray(response.body)).toBe(true);
    });

    /**
     * @description: This is the test for the JSON-Requests. It should return a 400 error because the title is required.
     * @returns {Promise<void>} - A promise that resolves when the test is complete.
     * @throws {Error} - An error if the test fails.
     */
    it('sollte JSON-Requests akzeptieren', async () => {
        const response = await request(app)
            .post('/api/v1/events')
            .send({ title: 'Test Event' })
            .expect(400);
        
        expect(response.body).toHaveProperty('error');
    });
}); 