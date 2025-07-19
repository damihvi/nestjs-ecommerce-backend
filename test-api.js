const http = require('http');

// Test basic API functionality
const testAPI = async () => {
  console.log('🔍 Testing eCommerce API...\n');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthReq = http.request('http://localhost:3101/api/health', { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Health endpoint response:', JSON.parse(data));
      });
    });
    
    healthReq.on('error', (err) => {
      console.log('❌ Health endpoint failed:', err.message);
    });
    
    healthReq.end();
    
    // Test categories endpoint
    setTimeout(() => {
      console.log('\nTesting categories endpoint...');
      const categoriesReq = http.request('http://localhost:3101/api/categories', { method: 'GET' }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('✅ Categories endpoint response:', JSON.parse(data));
        });
      });
      
      categoriesReq.on('error', (err) => {
        console.log('❌ Categories endpoint failed:', err.message);
      });
      
      categoriesReq.end();
    }, 1000);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

// Wait for server to start, then test
setTimeout(testAPI, 3000);

console.log('⏳ Waiting for server to start...');
