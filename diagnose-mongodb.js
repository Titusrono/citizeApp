#!/usr/bin/env node

/**
 * Diagnostic script to check MongoDB collections and users
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './api/.env' });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

console.log('🔍 MongoDB Diagnostic Tool');
console.log('📍 Connecting to MongoDB...');

async function runDiagnostics() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    
    // List all collections
    console.log('📋 Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check for users collection (TypeORM might use different names)
    const possibleUserCollections = ['user', 'users', 'User', 'Users'];
    let userCollection = null;
    
    for (const name of possibleUserCollections) {
      const col = db.collection(name);
      const count = await col.countDocuments();
      if (count > 0) {
        userCollection = { name, col, count };
        break;
      }
    }
    
    if (!userCollection) {
      console.log('\n❌ No users collection found!');
      process.exit(1);
    }
    
    console.log(`\n✅ Found users in collection: "${userCollection.name}" (${userCollection.count} users)`);
    
    // Get all users
    console.log('\n👥 Users in database:');
    const users = await userCollection.col.find().toArray();
    users.forEach((user, i) => {
      console.log(`\n  ${i + 1}. Email: ${user.email}`);
      console.log(`     ID (ObjectId): ${user._id}`);
      console.log(`     ID (string): ${user._id.toString()}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Username: ${user.username}`);
    });
    
    // Check for specific user from token
    const targetId = '69f3473008fe37ea519c6da1';
    console.log(`\n🔎 Searching for user ID: ${targetId}`);
    
    const { ObjectId } = require('mongodb');
    const found = users.find(u => u._id.toString() === targetId);
    
    if (found) {
      console.log('✅ User FOUND!');
      console.log(`   Email: ${found.email}`);
      console.log(`   Role: ${found.role}`);
    } else {
      console.log('❌ User NOT found with that ID');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

runDiagnostics();
