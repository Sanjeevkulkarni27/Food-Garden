const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * 
 * If MONGODB_URI is set in .env, it connects to that (Atlas / remote).
 * Otherwise, it spins up an in-memory MongoDB instance via mongodb-memory-server
 * so the project works out of the box with zero setup.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    let uri = process.env.MONGODB_URI;

    // If no real URI is configured, use in-memory MongoDB
    if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
      console.log('⏳ No MongoDB URI configured. Starting in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log('✅ In-memory MongoDB started successfully');
      console.log('💡 Tip: Set MONGODB_URI in .env for persistent data');
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
