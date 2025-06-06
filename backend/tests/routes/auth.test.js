import request from 'supertest';
import { app } from '../../server.js';
import User from '../../models/User.js';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test-secret-key';

describe('Auth Routes', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    };

    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('POST /api/v1/auth/register', () => {
        /**
         * @description: This is the test to register a new user.
         * @returns {Promise<void>} - A promise that resolves when the user is registered.
         * @throws {Error} - An error if the user is not registered.
         */
        it('sollte einen neuen User registrieren', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body.user).toHaveProperty('name', testUser.name);
            expect(response.body.user).not.toHaveProperty('password');
        });

        /**
         * @description: This is the test to register a new user with a duplicate email.
         * @returns {Promise<void>} - A promise that resolves when the user is registered.
         * @throws {Error} - An error if the user is not registered.
         */
        it('sollte einen Fehler werfen bei doppelter Email', async () => {
            await User.create(testUser);

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Ein Benutzer mit dieser Email existiert bereits');
        });

        /**
         * @description: This is the test to register a new user with an invalid email.
         * @returns {Promise<void>} - A promise that resolves when the user is registered.
         * @throws {Error} - An error if the user is not registered.
         */
        it('sollte einen Fehler werfen bei ungültiger Email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...testUser, email: 'invalid-email' })
                .expect(500);

            expect(response.body).toHaveProperty('error');
        });

        /**
         * @description: This is the test to register a new user with a too short password.
         * @returns {Promise<void>} - A promise that resolves when the user is registered.
         * @throws {Error} - An error if the user is not registered.
         */
        it('sollte einen Fehler werfen bei zu kurzem Passwort', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...testUser, password: '123' })
                .expect(500);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await User.create(testUser);
        });

        /**
         * @description: This is the test to login a user.
         * @returns {Promise<void>} - A promise that resolves when the user is logged in.
         * @throws {Error} - An error if the user is not logged in.
         */
        it('sollte erfolgreich einloggen', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        });

        /**
         * @description: This is the test to login a user with a wrong password.
         * @returns {Promise<void>} - A promise that resolves when the user is logged in.
         * @throws {Error} - An error if the user is not logged in.
         */
        it('sollte einen Fehler werfen bei falschem Passwort', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Ungültige Email oder Passwort');
        });

        /**
         * @description: This is the test to login a user with a non-existent email.
         * @returns {Promise<void>} - A promise that resolves when the user is logged in.
         * @throws {Error} - An error if the user is not logged in.
         */
        it('sollte einen Fehler werfen bei nicht existierender Email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Ungültige Email oder Passwort');
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let token;

        beforeEach(async () => {
            const user = await User.create(testUser);
            const loginResponse = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            token = loginResponse.body.token;
        });

        /**
         * @description: This is the test to get the current user.
         * @returns {Promise<void>} - A promise that resolves when the user is returned.
         * @throws {Error} - An error if the user is not returned.
         */
        it('sollte den aktuellen User zurückgeben', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body.user).toHaveProperty('name', testUser.name);
            expect(response.body.user).not.toHaveProperty('password');
        });

        /**
         * @description: This is the test to get the current user without a token.
         * @returns {Promise<void>} - A promise that resolves when the user is returned.
         * @throws {Error} - An error if the user is not returned.
         */
        it('sollte einen Fehler werfen ohne Token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Nicht authentifiziert');
        });

        /**
         * @description: This is the test to get the current user with an invalid token.
         * @returns {Promise<void>} - A promise that resolves when the user is returned.
         * @throws {Error} - An error if the user is not returned.
         */
        it('sollte einen Fehler werfen bei ungültigem Token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Ungültiger Token');
        });
    });
}); 