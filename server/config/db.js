const mongoose = require('mongoose');

let isInMemory = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssf_puthur_sector';
  const isProd = process.env.NODE_ENV === 'production';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // 15s for MongoDB Atlas SRV/TLS handshake
    });
    isInMemory = false;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.error(`❌ MongoDB connection failed (${err.message}).`);

    // Never silently fall back to ephemeral RAM in production or when an external URI is explicitly configured
    if (isProd || process.env.MONGODB_URI) {
      console.error('👉 Check MONGODB_URI, Atlas IP Whitelist (0.0.0.0/0), and database user credentials.');
      return false;
    }

    console.log('🔄 Attempting fallback to in-memory MongoDB for local zero-config execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      isInMemory = true;
      console.warn(`⚠️ In-Memory MongoDB Connected at: ${memoryUri} (DATA WILL NOT PERSIST ON RESTART)`);
      return true;
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB (${memErr.message}).`);
      return false;
    }
  }
};

connectDB.isInMemory = () => isInMemory;

module.exports = connectDB;
