#!/usr/bin/env node

/**
 * Check newly created citizen user permissions
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'citizeApp';

async function main() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    const permissionsCollection = db.collection('permissions');
    
    // Find the most recent citizen user
    const recentCitizen = await usersCollection.findOne(
      { role: 'citizen' },
      { sort: { createdAt: -1 } }
    );
    
    if (!recentCitizen) {
      console.log('❌ No citizen user found');
      return;
    }
    
    console.log('\n📋 MOST RECENT CITIZEN USER:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:', recentCitizen._id);
    console.log('Email:', recentCitizen.email);
    console.log('Role:', recentCitizen.role);
    console.log('permissionIds array:', recentCitizen.permissionIds);
    console.log('permissionIds count:', recentCitizen.permissionIds ? recentCitizen.permissionIds.length : 0);
    
    if (recentCitizen.permissionIds && recentCitizen.permissionIds.length > 0) {
      console.log('\n🔐 PERMISSIONS DETAILS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      for (const permId of recentCitizen.permissionIds) {
        const perm = await permissionsCollection.findOne({ _id: new ObjectId(permId) });
        if (perm) {
          console.log(`  ✅ ${perm.name}`);
        } else {
          console.log(`  ❌ Permission ID not found in DB: ${permId}`);
        }
      }
    } else {
      console.log('\n❌ NO PERMISSIONS ASSIGNED!');
    }
    
    console.log('\n📊 VIEW PERMISSIONS IN DATABASE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const viewPerms = await permissionsCollection.find({ action: 'view' }).toArray();
    if (viewPerms.length > 0) {
      viewPerms.forEach(p => {
        console.log(`  ✅ ${p.name} (ID: ${p._id})`);
      });
    } else {
      console.log('  ❌ No VIEW permissions found in database');
    }
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
