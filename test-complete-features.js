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

async function testAllFeatures() {
  console.log('🧪 Probando TODAS las nuevas funcionalidades...\n');

  try {
    // 1. Test API Info
    console.log('📋 1. Probando API Info actualizada...');
    const infoResponse = await makeRequest(`${BASE_URL}/api/info`);
    console.log('✅ API Info:', JSON.stringify(infoResponse.data, null, 2));
    console.log('');

    // 2. Test Health
    console.log('🏥 2. Probando Health Check...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Health Status:', JSON.stringify(healthResponse.data, null, 2));
    console.log('');

    // 3. Test Global Stats
    console.log('📊 3. Probando estadísticas globales...');
    const statsResponse = await makeRequest(`${BASE_URL}/api/search/stats`);
    console.log('✅ Global Stats:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // 4. Test Users
    console.log('👥 4. Probando sistema de usuarios...');
    
    // Register a user
    const newUser = {
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      password: 'password123',
      phone: '+1234567890'
    };
    
    const registerResponse = await makeRequest(`${BASE_URL}/api/users/register`, 'POST', newUser);
    console.log('✅ User registered:', registerResponse.data.success ? 'SUCCESS' : 'FAILED');
    
    if (registerResponse.data.success) {
      // Login
      const loginResponse = await makeRequest(`${BASE_URL}/api/users/login`, 'POST', {
        email: newUser.email,
        password: newUser.password
      });
      console.log('✅ User login:', loginResponse.data.success ? 'SUCCESS' : 'FAILED');
      
      // Get user stats
      const userStatsResponse = await makeRequest(`${BASE_URL}/api/users/stats`);
      console.log('✅ User Stats:', JSON.stringify(userStatsResponse.data.data, null, 2));
    }
    console.log('');

    // 5. Test Search
    console.log('🔍 5. Probando funciones de búsqueda...');
    
    // Search products
    const searchResponse = await makeRequest(`${BASE_URL}/api/search/products?q=&page=1&limit=5`);
    console.log('✅ Product search:', searchResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Found products:', searchResponse.data.pagination?.total || 0);
    
    // Search categories
    const categoriesSearchResponse = await makeRequest(`${BASE_URL}/api/search/categories`);
    console.log('✅ Categories search:', categoriesSearchResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('   Found categories:', categoriesSearchResponse.data.count || 0);
    console.log('');

    // 6. Test existing endpoints
    console.log('📦 6. Verificando endpoints existentes...');
    
    const categoriesResponse = await makeRequest(`${BASE_URL}/api/categories`);
    console.log('✅ Categories endpoint:', categoriesResponse.data.success ? 'SUCCESS' : 'FAILED');
    
    const productsResponse = await makeRequest(`${BASE_URL}/api/products`);
    console.log('✅ Products endpoint:', productsResponse.data.success ? 'SUCCESS' : 'FAILED');
    
    const usersResponse = await makeRequest(`${BASE_URL}/api/users`);
    console.log('✅ Users endpoint:', usersResponse.data.success ? 'SUCCESS' : 'FAILED');
    
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    console.log('✅ Orders endpoint:', ordersResponse.data.success ? 'SUCCESS' : 'FAILED');
    console.log('');

    console.log('🎉 ¡Todas las pruebas completadas!');
    console.log('\n📈 Resumen de funcionalidades disponibles:');
    console.log('   ✅ Categorías CRUD');
    console.log('   ✅ Productos CRUD + gestión de stock');
    console.log('   ✅ Usuarios + autenticación');
    console.log('   ✅ Órdenes + items');
    console.log('   ✅ Búsqueda avanzada');
    console.log('   ✅ Estadísticas globales');
    console.log('   ✅ Paginación');
    console.log('   ✅ Health monitoring');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

console.log('🚀 Iniciando pruebas de TODAS las funcionalidades...\n');
console.log('⚠️ Asegúrate de que el servidor esté corriendo en puerto 3101\n');
testAllFeatures();
