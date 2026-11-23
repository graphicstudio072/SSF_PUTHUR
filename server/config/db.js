const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ssf_puthur_sector';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}).`);
    console.log('🔄 Attempting fallback to in-memory MongoDB for local zero-config execution...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const memConn = await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB Connected at: ${memoryUri}`);
      return true;
    } catch (memErr) {
      console.error(`❌ Failed to start in-memory MongoDB (${memErr.message}).`);
      console.warn('👉 Please ensure MongoDB is running or set MONGODB_URI in server/.env');
      return false;
    }
  }
};

module.exports = connectDB;
