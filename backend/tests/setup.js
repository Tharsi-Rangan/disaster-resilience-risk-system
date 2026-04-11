const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.test") });

function ensureSafeTestDb() {
  const dbName = mongoose.connection?.db?.databaseName || "";
  if (!dbName || !dbName.toLowerCase().includes("test")) {
    throw new Error(`Unsafe test database detected: ${dbName || "unknown"}. Refusing to continue.`);
  }
  return dbName;
}

beforeAll(async () => {
  if (!process.env.MONGO_URI_TEST) {
    throw new Error("MONGO_URI_TEST is not set. Add it to backend/.env.test before running backend tests.");
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-jwt-secret";
  }
  await mongoose.connect(process.env.MONGO_URI_TEST);
  const dbName = ensureSafeTestDb();
  console.log(`[tests] Connected to database: ${dbName}`);
});

afterEach(async () => {
  if (!mongoose.connection?.db) return;
  ensureSafeTestDb();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});