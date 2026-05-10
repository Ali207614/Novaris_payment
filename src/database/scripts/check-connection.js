const { connectDB, disconnectDB } = require('../mongoose.module');

const checkConnection = async () => {
  console.log('Starting MongoDB connection check...');
  try {
    const connection = await connectDB();

    // Ping the database
    const adminDb = connection.db.admin();
    const pingResult = await adminDb.ping();

    if (pingResult.ok === 1) {
      console.log('✅ MongoDB ping successful.');
      console.log(`✅ Connected to database: ${connection.name}`);
      process.exitCode = 0;
    } else {
      console.error('❌ MongoDB ping failed:', pingResult);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

checkConnection();
