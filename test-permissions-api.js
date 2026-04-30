#!/usr/bin/env node

/**
 * Test the permissions API endpoint directly
 */

const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNpbWlvbnJvcDk4QGdtYWlsLmNvbSIsInN1YiI6IjY5ZjM0NzMwMDhmZTM3ZWE1MTljNmRhMSIsInJvbGUiOiJjaXRpemVuIiwiaWF0IjoxNzc3NTUyOTU1LCJleHAiOjE3Nzc1NTY1NTV9.TvI2m0DzDuHn_qH1cO7Ii_Cc6XXV03Z2ql4AHU0ZyYE';

// Sample permission IDs from the test data
const permissionIds = [
  '69da8640b613e379d85a99ff', // view:issues
  '69da8641b613e379d85a9a00', // view:petitions
  '69da8643b613e379d85a9a01', // view:blogs
  '69da8644b613e379d85a9a02', // view:votes
  '69da8645b613e379d85a9a03'  // view:townhalls
];

const postData = JSON.stringify({ ids: permissionIds });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/permissions/by-ids',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${TOKEN}`
  }
};

console.log('🔍 Testing permissions API endpoint...');
console.log('POST /permissions/by-ids');
console.log('Sending', permissionIds.length, 'permission IDs\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    
    try {
      const result = JSON.parse(data);
      console.log('\n✅ SUCCESS! Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (Array.isArray(result)) {
        console.log(`\n📋 Received ${result.length} permissions:`);
        result.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.action}:${p.resource}`);
        });
      }
    } catch (e) {
      console.log('📝 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(postData);
req.end();
