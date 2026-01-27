const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('citizeApp');
    const collection = database.collection('users');

    // Update the first user to admin
    const result = await collection.updateOne(
      {},
      { $set: { role: 'admin' } }
    );

    console.log(`Updated ${result.modifiedCount} document(s)`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);