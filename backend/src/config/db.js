const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI not found in .env file");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  const connection = await connectionPromise;

  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB connected successfully");
  }

  return connection;
}

module.exports = connectDB;
