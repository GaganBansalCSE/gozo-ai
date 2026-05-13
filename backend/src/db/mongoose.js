const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  logger.info("MongoDB connected", {
    host: mongoose.connection.host,
    dbName: mongoose.connection.name,
  });
}

module.exports = { connectMongoDB };
