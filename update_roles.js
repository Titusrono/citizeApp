const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('citizeApp');
    const collection = database.collection('users');

    const result = await collection.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'citizen' } }
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);