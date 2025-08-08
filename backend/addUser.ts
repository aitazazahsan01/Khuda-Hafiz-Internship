import * as mysql from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// new user ---
interface NewUser {
  id: string;
  fullName: string;
  email: string;
  plainPassword: string;
  role: 'administrator' | 'user';
}

// --- User Details 
const user: NewUser = {
  id: uuidv4(),
  fullName: 'Admin User',
  email: 'admin@example.com',
  plainPassword: 'password123',
  role: 'administrator',
};

// --- Database Connection ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'offer_alert_system'
});

async function createAdminUser() {
  console.log('Connecting to the database...');
  const connection = await pool.getConnection();
  console.log('Connected.');

  try {
    console.log(`Hashing password: ${user.plainPassword}...`);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.plainPassword, saltRounds);
    console.log('Password hashed.');

    const sql = `
      INSERT INTO users (id, full_name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    console.log('Inserting user into the database...');
    await connection.execute(sql, [
      user.id,
      user.fullName,
      user.email,
      hashedPassword,
      user.role,
    ]);

    console.log(' Success! Admin user created.');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.plainPassword}`);

  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Error: A user with this email already exists.');
    } else {
      console.error('An error occurred:', error);
    }
  } finally {
    connection.release();
    pool.end();
    console.log('Database connection closed.');
  }
}

createAdminUser();