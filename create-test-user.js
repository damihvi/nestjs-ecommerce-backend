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
    
    // Primero verificar si ya existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario de prueba ya existe: test@example.com / 123456');
    } else {
      const query = `
        INSERT INTO users (email, name, "firstName", "lastName", password, role, "isActive", "createdAt")
        VALUES ('test@example.com', 'Test User', 'Test', 'User', $1, 'user', true, NOW())
      `;

      await pool.query(query, [hashedPassword]);
      console.log('✅ Usuario de prueba creado: test@example.com / 123456');
    }
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();
