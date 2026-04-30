#!/usr/bin/env node

/**
 * ===== PERMISSION RESEED SCRIPT =====
 * Resets permissions database with new VIEW actions for citizens
 * 
 * Usage:
 *   node reseed-permissions.js <super-admin-token>
 */

const http = require('http');

const superAdminToken = process.argv[2];

if (!superAdminToken) {
  console.error('❌ Error: Super admin token required');
  console.error('Usage: node reseed-permissions.js <token>');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/permissions/seed',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${superAdminToken}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('🌱 [SEED] Response Status:', res.statusCode);
    try {
      const result = JSON.parse(data);
      console.log('✅ [SEED] Permissions reseeded successfully!');
      console.log('📝 [SEED] Response:', result);
    } catch (e) {
      console.log('📝 [SEED] Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

console.log('🌱 [SEED] Sending reseed request...');
req.end();
