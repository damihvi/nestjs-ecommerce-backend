const http = require('http');

const BASE_URL = 'http://localhost:3101';

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ data: jsonBody, status: res.statusCode });
        } catch (e) {
          resolve({ data: body, status: res.statusCode });
        }
      });
    });

    req.on('error', reject);

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testNewFeatures() {
  console.log('🧪 Probando nuevas funcionalidades...\n');

  try {
    // Test API Info
    console.log('� 1. Probando API Info...');
    const infoResponse = await makeRequest(`${BASE_URL}/api/info`);
    console.log('✅ API Info:', JSON.stringify(infoResponse.data, null, 2));
    console.log('');

    // Test Health
    console.log('🏥 2. Probando Health Check...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Health Status:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // Test Products endpoints
    console.log('📦 3. Probando endpoints de Productos...');
    
    const productsResponse = await makeRequest(`${BASE_URL}/api/products`);
    console.log('✅ Products list:', JSON.stringify(productsResponse.data, null, 2));
    console.log('');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

console.log('🚀 Iniciando pruebas de nuevas funcionalidades...\n');
console.log('⚠️ Asegúrate de que el servidor esté corriendo en puerto 3101\n');
testNewFeatures();
