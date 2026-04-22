import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'emergencytool',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

const seedAdmin = async () => {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, barangay, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@emergencytool.local', passwordHash, 'Admin', 'User', '09123456789', 'Main', 'admin']
    );
    
    console.log('✅ Admin user created: admin@emergencytool.local');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await pool.end();
  }
};

seedAdmin();