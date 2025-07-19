const { Pool } = require('pg');

// URL de la base de datos
const DATABASE_URL = 'postgresql://neondb_owner:npg_6TFM1oalwICR@ep-lingering-morning-a4fze2qp-pooler.us-east-1.aws.neon.tech:5432/blogdb';

async function createTestUser() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Hash simple para la contraseña "123456"
    const hashedPassword = Buffer.from('123456' + 'simple-salt').toString('base64');
    
    const query = `
      INSERT INTO users (id, email, "name", password, role, "isActive", "createdAt")
      VALUES (gen_random_uuid(), 'test@example.com', 'Test User', $1, 'user', true, NOW())
      ON CONFLICT (email) DO NOTHING;
    `;

    await pool.query(query, [hashedPassword]);
    console.log('✅ Usuario de prueba creado: test@example.com / 123456');
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
