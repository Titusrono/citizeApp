#!/usr/bin/env node

/**
 * Check if a user exists in MongoDB by email
 * Usage: node check-user-by-email.js admin1@gmail.com
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './api/.env' });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

console.log('🔍 Checking user in MongoDB...');
console.log('📍 URI:', mongoUri.replace(/:[^:]*@/, ':***@'));

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  role: String,
  permissionIds: [String],
  permissionNames: [String],
}, { collection: 'user' });

const User = mongoose.model('User', userSchema);

async function checkUser() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2] || 'admin1@gmail.com';
    console.log(`\n🔎 Searching for: ${email}`);

    const user = await User.findOne({ email });
    
    if (user) {
      console.log('\n✅ User found:');
      console.log('  ID:', user._id.toString());
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('  Role:', user.role);
      console.log('  Permissions:', user.permissionIds?.length || 0);
    } else {
      console.log('\n❌ User NOT found in database');
      
      // List all users
      const allUsers = await User.find().limit(5);
      console.log(`\n📋 Database has ${await User.countDocuments()} user(s)`);
      if (allUsers.length > 0) {
        console.log('\nFirst few users:');
        allUsers.forEach(u => {
          console.log(`  - ${u.email} (${u._id})`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUser();
