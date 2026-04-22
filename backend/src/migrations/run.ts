import { Pool } from 'pg';
import 'dotenv/config';
import { schemaStatements } from '../config/schemaDefinition';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'emergencytool',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

const runMigrations = async () => {
  console.log('Running migrations...');
  
  for (let i = 0; i < schemaStatements.length; i++) {
    try {
      await pool.query(schemaStatements[i]);
      console.log(`✅ Migration ${i + 1} applied`);
    } catch (error: any) {
      if (error.code === '42P07') {
        console.log(`⏭ Table already exists, skipping`);
      } else {
        console.log(`⚠️ Migration ${i + 1} error: ${error.message}`);
      }
    }
  }
  
  console.log('✅ Migrations complete!');
  await pool.end();
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
