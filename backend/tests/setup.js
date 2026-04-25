require('dotenv').config(); // Load .env so env vars are available in all test files

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Guarantee a JWT_SECRET exists for tests even if .env has none
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jest-test-secret-key-do-not-use-in-production';
}

let mongoServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();
//   process.env.MONGO_URI = uri;
//   await mongoose.connect(uri);
// });

// afterAll(async () => {
//   await mongoose.connection.close();
//   await mongoServer.stop();
// });