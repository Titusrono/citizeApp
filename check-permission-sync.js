#!/usr/bin/env node

/**
 * Check permissions in MongoDB and match them with user permission IDs
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: './api/.env' });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set');
  process.exit(1);
}

async function checkPermissions() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get the citizen user we're debugging
    const user = await db.collection('users').findOne({
      email: 'simionrop98@gmail.com'
    });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('👤 User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Permission IDs in user doc: ${user.permissionIds ? user.permissionIds.length : 0}`);
    console.log(`   Permission Names: ${user.permissionNames ? user.permissionNames.join(', ') : 'none'}`);
    
    // Check permissions collection
    const permissionsCount = await db.collection('permissions').countDocuments();
    console.log(`\n📋 Permissions collection: ${permissionsCount} total permissions`);
    
    if (permissionsCount > 0) {
      const allPerms = await db.collection('permissions').find({}).toArray();
      console.log('\n   All permissions:');
      allPerms.forEach(p => {
        console.log(`   - ${p.action}:${p.resource} (ID: ${p._id})`);
      });
    }
    
    // Check if user permission IDs exist in the permissions collection
    if (user.permissionIds && user.permissionIds.length > 0) {
      console.log(`\n🔍 Checking if user's permission IDs exist in collection...`);
      
      const userPermIds = user.permissionIds.map(id => {
        if (typeof id === 'string') {
          return new ObjectId(id);
        }
        return id;
      });
      
      const foundPerms = await db.collection('permissions').find({
        _id: { $in: userPermIds }
      }).toArray();
      
      console.log(`   Found ${foundPerms.length} of ${userPermIds.length} permissions`);
      
      if (foundPerms.length > 0) {
        console.log('   ✓ Permissions found:');
        foundPerms.forEach(p => {
          console.log(`     - ${p.action}:${p.resource}`);
        });
      }
      
      if (foundPerms.length < userPermIds.length) {
        console.log('\n⚠️  WARNING: Some permission IDs don\'t exist in the database!');
        console.log('   This is why the sidebar can\'t be populated.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkPermissions();
