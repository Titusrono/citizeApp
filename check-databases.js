#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citizeapp';

async function checkDatabases() {
  let client;
  try {
    console.log('🔌 Connecting to MongoDB at:', MONGO_URI);
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    // List all databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    
    console.log('\n📚 ===== AVAILABLE DATABASES =====');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // Try different database names
    const possibleDbs = ['citizeapp', 'cite-app', 'citize-app', 'test', 'admin'];
    
    for (const dbName of possibleDbs) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log(`\n📋 ===== COLLECTIONS IN "${dbName}" =====`);
        for (const col of collections) {
          const count = await db.collection(col.name).countDocuments();
          console.log(`  - ${col.name}: ${count} documents`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

checkDatabases();
