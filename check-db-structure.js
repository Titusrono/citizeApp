#!/usr/bin/env node

/**
 * Check database structure and find any recent users
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'citizeApp';

async function main() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // List all collections
    console.log('📚 COLLECTIONS IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`  📁 ${col.name}`));
    
    // Get user count
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 USERS COUNT: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\n📋 LAST 5 USERS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      const users = await usersCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray();
      
      users.forEach((user, idx) => {
        console.log(`\n${idx + 1}. ${user.email}`);
        console.log(`   ID: ${user._id || user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   permissionIds: ${user.permissionIds ? user.permissionIds.length : 0} permissions`);
        if (user.permissionIds && user.permissionIds.length > 0) {
          console.log(`   First 3: ${user.permissionIds.slice(0, 3).join(', ')}`);
        }
      });
    }
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
