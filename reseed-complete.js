#!/usr/bin/env node

/**
 * ===== COMPLETE PERMISSION RESEED =====
 * 
 * This script:
 * 1. Waits for backend to be ready
 * 2. Gets super admin token by creating a super admin user if needed
 * 3. Calls the permissions seed endpoint
 * 4. Verifies the new VIEW permissions were created
 */

const http = require('http');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'citizeApp';
const API_URL = 'http://localhost:3000';
const SUPER_ADMIN_EMAIL = 'superadmin@test.com';
const SUPER_ADMIN_PASSWORD = 'AdminPassword123!';

let jwtToken = null;

// ===== STEP 1: Check if backend is ready =====
async function waitForBackend(maxAttempts = 30) {
  console.log('⏳ Waiting for backend to be ready...');
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await makeRequest('GET', '/api/permissions');
      console.log('✅ Backend is ready!');
      return true;
    } catch (err) {
      if (i < maxAttempts - 1) {
        console.log(`  Attempt ${i + 1}/${maxAttempts} - waiting...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('❌ Backend failed to start after 30 seconds');
  process.exit(1);
}

// ===== STEP 2: Ensure super admin exists in database =====
async function ensureSuperAdminExists() {
  console.log('\n🔐 Ensuring super admin user exists...');
  
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    const existingAdmin = await usersCollection.findOne({ 
      email: SUPER_ADMIN_EMAIL 
    });
    
    if (existingAdmin) {
      console.log('✅ Super admin already exists');
      return;
    }
    
    console.log('➕ Creating new super admin user...');
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    
    const result = await usersCollection.insertOne({
      username: 'Super Admin',
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      phone_no: '1234567890',
      subCounty: 'test',
      ward: 'test',
      role: 'super_admin',
      permissionIds: [],
      auth_token: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Super admin user created:', result.insertedId);
  } finally {
    await client.close();
  }
}

// ===== STEP 3: Get super admin JWT token =====
async function getSuperAdminToken() {
  console.log('\n🔑 Getting super admin JWT token...');
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    });
    
    jwtToken = response.access_token;
    console.log('✅ JWT token obtained');
    console.log('   Token:', jwtToken.substring(0, 50) + '...');
    return jwtToken;
  } catch (err) {
    console.error('❌ Failed to get JWT token:', err.message);
    process.exit(1);
  }
}

// ===== STEP 4: Call seed endpoint =====
async function seedPermissions() {
  console.log('\n🌱 Seeding default permissions...');
  
  try {
    const response = await makeRequest('POST', '/api/permissions/seed', {}, {
      'Authorization': `Bearer ${jwtToken}`
    });
    
    console.log('✅ Permissions seeded successfully!');
    console.log('   Response:', response.message);
    return response;
  } catch (err) {
    console.error('❌ Failed to seed permissions:', err.message);
    process.exit(1);
  }
}

// ===== STEP 5: Verify VIEW permissions were created =====
async function verifyViewPermissions() {
  console.log('\n✔️  Verifying VIEW permissions...');
  
  try {
    const response = await makeRequest('GET', '/api/permissions');
    
    const viewPermissions = response.filter(p => p.action === 'view');
    const readPermissions = response.filter(p => p.action === 'read');
    
    console.log(`✅ Total permissions: ${response.length}`);
    console.log(`   VIEW permissions (citizen): ${viewPermissions.length}`);
    console.log(`   READ permissions (admin): ${readPermissions.length}`);
    
    if (viewPermissions.length > 0) {
      console.log('   View permissions found:');
      viewPermissions.forEach(p => {
        console.log(`     - ${p.name}`);
      });
    } else {
      console.warn('   ⚠️  No VIEW permissions found! The seed may have failed.');
    }
    
    return viewPermissions.length > 0;
  } catch (err) {
    console.error('❌ Failed to verify permissions:', err.message);
    process.exit(1);
  }
}

// ===== UTILITY: Make HTTP requests =====
async function makeRequest(method, path, body = {}, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(path, API_URL);
    
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers,
      timeout: 10000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (Object.keys(body).length > 0) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ===== MAIN EXECUTION =====
async function main() {
  console.log('════════════════════════════════════════');
  console.log('  CITIZEN CONNECT - PERMISSION RESEED');
  console.log('════════════════════════════════════════');
  
  try {
    await waitForBackend();
    await ensureSuperAdminExists();
    await getSuperAdminToken();
    await seedPermissions();
    const success = await verifyViewPermissions();
    
    console.log('\n✅ ═══════════════════════════════════════');
    if (success) {
      console.log('   RESEED COMPLETE - VIEW PERMISSIONS EXIST!');
    } else {
      console.log('   RESEED COMPLETE - VERIFY VIEW PERMISSIONS!');
    }
    console.log('═══════════════════════════════════════');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Refresh the browser (Ctrl+R)');
    console.log('   2. Register a new citizen user');
    console.log('   3. Login and check sidebar');
    console.log('   4. Should see all 5 citizen components now!');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    process.exit(1);
  }
}

main();
