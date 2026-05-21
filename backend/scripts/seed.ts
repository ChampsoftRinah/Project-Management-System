import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rinah',
  database: process.env.DB_NAME || 'pm_system',
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seed...');

    // Create tenant
    const tenantId = uuidv4();
    await client.query(
      `INSERT INTO tenants (id, name, is_active) 
       VALUES ($1, $2, true)
       ON CONFLICT (id) DO NOTHING`,
      [tenantId, 'Test Organization']
    );
    console.log(`✅ Tenant created: ${tenantId}`);

    // Create admin user
    const userId = uuidv4();
    const hashedPassword = bcrypt.hashSync('123456', 10);
    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (tenant_id, email) DO NOTHING`,
      [userId, tenantId, 'admin@test.com', hashedPassword, 'Admin', 'User']
    );
    console.log(`✅ User created: admin@test.com`);

    // Assign roles
    const roles = ['Tenant Admin', 'Project Manager'];
    for (const role of roles) {
      const roleId = uuidv4();
      await client.query(
        `INSERT INTO user_roles (id, tenant_id, user_id, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tenant_id, user_id, role) DO NOTHING`,
        [roleId, tenantId, userId, role]
      );
    }
    console.log(`✅ Roles assigned to user`);

    console.log('\n✨ Database seeding complete!');
    console.log(
      `\nTest credentials:\n  Email: admin@test.com\n  Password: 123456\n  Tenant ID: ${tenantId}`
    );
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
