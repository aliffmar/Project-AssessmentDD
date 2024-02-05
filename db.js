const { MongoClient } = require('mongodb');
require('dotenv').config();

let client; // Declare the client variable

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client; // Return the connected client
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  }
}

function getDB() {
  if (!client) {
    throw new Error('Database client not initialized');
  }
  return client.db("test");
}

module.exports = { connectToMongoDB, getDB };
