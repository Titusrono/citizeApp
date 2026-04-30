#!/usr/bin/env node

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citizeapp';

async function checkPermissions() {
  let client;
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    
    const db = client.db('citizeapp');
    
    // Check permissions collection
    console.log('\n📋 ===== PERMISSIONS COLLECTION =====');
    const permissionsCount = await db.collection('permissions').countDocuments();
    console.log(`Total permissions: ${permissionsCount}`);
    
    if (permissionsCount > 0) {
      const permissions = await db.collection('permissions').find({}).limit(5).toArray();
      console.log(`\nFirst ${Math.min(5, permissions.length)} permissions:`);
      permissions.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.action}:${p.resource} (ID: ${p._id})`);
      });
    }
    
    // Check users and their permission IDs
    console.log('\n👥 ===== USERS & PERMISSION IDs =====');
    const users = await db.collection('users').find({}).limit(3).toArray();
    console.log(`Found ${users.length} users (showing first 3):`);
    
    for (const user of users) {
      console.log(`\n  👤 ${user.email || user.username || 'Unknown'}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Permission IDs: ${user.permissionIds ? user.permissionIds.length : 0}`);
      
      if (user.permissionIds && user.permissionIds.length > 0) {
        console.log(`     First 3 IDs: ${user.permissionIds.slice(0, 3).join(', ')}`);
        
        // Check if these IDs exist in permissions collection
        const existingPerms = await db.collection('permissions').find({
          _id: { $in: user.permissionIds.slice(0, 3) }
        }).toArray();
        console.log(`     ✓ Found ${existingPerms.length} of 3 first IDs in permissions collection`);
      }
    }
    
    // Summary
    console.log('\n📊 ===== SUMMARY =====');
    console.log(`✓ Total Permissions: ${permissionsCount}`);
    console.log(`✓ Total Users: ${await db.collection('users').countDocuments()}`);
    
    if (permissionsCount === 0) {
      console.log('\n⚠️  WARNING: No permissions found in database!');
      console.log('   You need to seed permissions first.');
      console.log('   Run: node reseed-permissions.js <super-admin-token>');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) await client.close();
  }
}

checkPermissions();
