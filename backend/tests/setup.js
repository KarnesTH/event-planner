import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

/**
 * @description: This is the setup file for the tests. It starts the MongoDB Memory Server and connects to the database.
 * @returns {Promise<void>} - A promise that resolves when the setup is complete.
 * @throws {Error} - An error if the setup fails.
 */
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

/**
 * @description: This is the afterEach function for the tests. It clears the database after each test.
 * @returns {Promise<void>} - A promise that resolves when the database is cleared.
 * @throws {Error} - An error if the database fails to clear.
 */
afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
});

/**
 * @description: This is the afterAll function for the tests. It closes the connection to the database and stops the MongoDB Memory Server.
 * @returns {Promise<void>} - A promise that resolves when the connection is closed and the server is stopped.
 * @throws {Error} - An error if the connection fails to close or the server fails to stop.
 */
afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    await mongod.stop();
}); 