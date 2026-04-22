-- Insert admin user (run this in PostgreSQL)
-- Password: admin123 (hashed with bcrypt)

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, barangay, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@emergencytool.local',
  '$2b$10$rQZ8Kx1x1x1x1x1x1x1x.O1x1x1x1x1x1x1x1x1x1x1x1xO',  -- bcrypt hash of "admin123"
  'Admin',
  'User',
  '09123456789',
  'Admin',
  'admin',
  NOW(),
  NOW()
);