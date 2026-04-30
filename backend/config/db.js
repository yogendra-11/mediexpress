const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Try connecting to local MongoDB first
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('localhost')) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    }

    // Fall back to in-memory MongoDB
    console.log('⏳ Starting in-memory MongoDB...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-memory MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
