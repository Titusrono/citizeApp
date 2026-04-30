#!/usr/bin/env node

/**
 * Create a test CITIZEN user via API
 * Usage: node create-citizen-user.js
 */

const http = require('http');

const testUser = {
  email: 'citizen@example.com',
  password: 'password123',
  username: 'testcitizen',
  phone_no: '0712345678',
  subCounty: 'Test Sub County',
  ward: 'Test Ward',
  role: 'CITIZEN'
};

console.log('📝 Creating test CITIZEN user via API...\n');

const postData = JSON.stringify(testUser);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('\n✅ CITIZEN user created successfully!\n');
        console.log('📧 Email:', testUser.email);
        console.log('🔐 Password:', testUser.password);
        console.log('👤 Username:', testUser.username);
        console.log('🎯 Role:', testUser.role);
        console.log('🔑 User ID:', result.id || result._id || 'Created');
        
        console.log('\n✨ Login with these credentials:');
        console.log(`\nEmail: ${testUser.email}`);
        console.log(`Password: ${testUser.password}`);
        
        console.log('\n📍 Or use curl:');
        console.log('curl -X POST http://localhost:3000/auth/login \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log(`  -d '{"email": "${testUser.email}", "password": "${testUser.password}"}'`);
      } else if (result.message && result.message.includes('already exists')) {
        console.log('\n⚠️  User already exists!\n');
        console.log('📧 Email:', testUser.email);
        console.log('🔐 Password:', testUser.password);
        console.log('\n✨ Use these credentials to login');
      } else {
        console.log('\n❌ Error:', result.message || data);
      }
    } catch (e) {
      if (data.includes('already exists')) {
        console.log('\n⚠️  User already exists!\n');
        console.log('📧 Email:', testUser.email);
        console.log('🔐 Password:', testUser.password);
      } else {
        console.log('\n❌ Error parsing response:', data);
      }
    }
    
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('\n⚠️  Make sure the backend is running on http://localhost:3000');
  process.exit(1);
});

req.write(postData);
req.end();
