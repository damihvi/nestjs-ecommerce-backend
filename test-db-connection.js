// Test de conexión a la base de datos
const { Client } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a la base de datos PostgreSQL...\n');
  
  const DATABASE_URL = 'postgresql://neondb_owner:npg_6TFM1oalwICR@ep-lingering-morning-a4fze2qp-pooler.us-east-1.aws.neon.tech:5432/blogdb';
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    console.log('Probando consulta...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Consulta exitosa:', result.rows[0]);
    
    // Verificar si existe la tabla categories
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'categories'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Tabla "categories" existe');
      const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
      console.log(`📊 Número de categorías: ${categoryCount.rows[0].count}`);
    } else {
      console.log('⚠️  Tabla "categories" no existe - se creará automáticamente');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Código de error:', error.code);
  } finally {
    await client.end();
    console.log('🔚 Conexión cerrada');
  }
}

testDatabaseConnection();
