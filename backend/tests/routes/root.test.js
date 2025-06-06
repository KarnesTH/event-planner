import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../../server.js';
import mongoose from 'mongoose';


describe('Root Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * @description: This is the test for the Root-Route. It should return a 200 status code and a JSON object with the server status.
     * @returns {Promise<void>} - A promise that resolves when the test is complete.
     * @throws {Error} - An error if the test fails.
     */
    it('sollte den Server-Status zurückgeben', async () => {
        mongoose.connection.readyState = 1;
        
        const response = await request(app)
            .get('/')
            .expect(200);
        
        expect(response.body).toEqual({
            message: 'Server läuft',
            status: 'success',
            version: '1.0.0',
            db: 'verbunden'
        });
    });

    /**
     * @description: This is the test for the Root-Route. It should return a 200 status code and a JSON object with the server status.
     * @returns {Promise<void>} - A promise that resolves when the test is complete.
     * @throws {Error} - An error if the test fails.
     */
    it('sollte den getrennten DB-Status anzeigen', async () => {
        mongoose.connection.readyState = 0;
        
        const response = await request(app)
            .get('/')
            .expect(200);
        
        expect(response.body).toEqual({
            message: 'Server läuft',
            status: 'success',
            version: '1.0.0',
            db: 'getrennt'
        });
    });
}); 