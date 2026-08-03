import '../config/env.js';
import dns from 'dns';
import { connect } from 'mongoose';

// Fix Node.js DNS SRV lookup issues on Windows and custom local network resolvers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  console.warn('Could not override DNS servers:', err.message);
}

const connectToDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  console.log('CONNECTING TO DB:', mongoUrl ? mongoUrl.replace(/:([^@]+)@/, ':****@') : 'Not set');

  if (!mongoUrl) {
    console.error('MONGO_URL environment variable is missing.');
    return;
  }

  try {
    await connect(mongoUrl);
    console.log('Successfully connected to MongoDB Database');
  } catch (err) {
    console.error('Error connecting to DB:', err);
  }
};

export default connectToDB;