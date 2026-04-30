#!/usr/bin/env node

/**
 * Test the permissions API endpoint with real permission IDs from the server
 */

const http = require('http');

// First, get all permissions, then test the /by-ids endpoint with a subset
function getAllPermissions() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/permissions',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Test the /by-ids endpoint with specific IDs
function getPermissionsByIds(ids) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ ids });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/permissions/by-ids',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  try {
    console.log('🔍 Testing permissions API endpoint...\n');

    // Step 1: Get all permissions
    console.log('📋 Step 1: Fetching all permissions...');
    const allPerms = await getAllPermissions();
    console.log(`✅ Found ${allPerms.length} total permissions\n`);

    if (allPerms.length === 0) {
      console.log('❌ No permissions found in database');
      process.exit(1);
    }

    // Step 2: Select 5 random permissions
    const selectedPerms = allPerms.slice(0, 5);
    const selectedIds = selectedPerms.map(p => p.id);
    
    console.log('📋 Step 2: Testing /permissions/by-ids with 5 permissions:');
    selectedPerms.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.action}:${p.resource} (ID: ${p.id})`);
    });
    console.log();

    // Step 3: Call the /by-ids endpoint
    console.log('🔄 Step 3: Calling /permissions/by-ids endpoint...');
    const result = await getPermissionsByIds(selectedIds);

    console.log(`📊 Response Status: ${result.statusCode}`);
    console.log(`✅ Received ${result.data.length} permissions\n`);

    if (result.data.length === selectedPerms.length) {
      console.log('✅ SUCCESS! All permissions returned correctly:');
      result.data.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.action}:${p.resource}`);
      });
    } else {
      console.log(`⚠️  Expected ${selectedPerms.length} but got ${result.data.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runTest();
