const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.test") });

const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Guarantee a JWT_SECRET exists for tests even if .env has none
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jest-test-secret-key-do-not-use-in-production';
}

let mongoServer;
let activeTestUri = "";

function getDbNameFromUri(uri) {
  try {
    const parsed = new URL(uri);
    return parsed.pathname.replace(/^\//, "").split("?")[0] || "";
  } catch {
    return "";
  }
}

function assertSafeTestUri(uri, label = "test") {
  if (!uri) {
    throw new Error(`No MongoDB URI provided for ${label}.`);
  }

  if (uri.includes("mongodb.net")) {
    throw new Error(`Refusing to use Atlas URI for ${label}: ${uri}`);
  }

  const dbName = getDbNameFromUri(uri);
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(`Refusing to use non-test database "${dbName}" for ${label}.`);
  }

  return dbName;
}

beforeAll(async () => {
  const configuredTestUri = process.env.MONGO_URI_TEST || "";
  if (configuredTestUri) {
    assertSafeTestUri(configuredTestUri, ".env.test MONGO_URI_TEST");
    activeTestUri = configuredTestUri;
  } else {
    try {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: "drss_jest_test",
        },
      });
      activeTestUri = mongoServer.getUri();
    } catch (error) {
      throw new Error(`No safe test database available. MongoMemoryServer failed: ${error.message}`);
    }
  }

  const dbName = assertSafeTestUri(activeTestUri, mongoServer ? "mongodb-memory-server" : ".env.test fallback");
  // Expose the active test URI so tests that check process.env.MONGO_URI still pass
  process.env.MONGO_URI = activeTestUri;
  process.env.MONGO_URI_TEST = activeTestUri;
  process.env.NODE_ENV = "test";
  console.log(`[test-setup] Using MongoDB URI: ${activeTestUri}`);
  console.log(`[test-setup] Using MongoDB database: ${dbName}`);
  await mongoose.connect(activeTestUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
