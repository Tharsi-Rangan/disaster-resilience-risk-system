require('dotenv').config(); // Load .env so env vars are available in all test files

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Guarantee a JWT_SECRET exists for tests even if .env has none
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jest-test-secret-key-do-not-use-in-production';
}

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // Expose the in-memory URI so tests that check process.env.MONGO_URI still pass
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});