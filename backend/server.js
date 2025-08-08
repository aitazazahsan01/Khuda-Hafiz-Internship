import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const pool = mysql.createPool({
  host: 'localhost', 
  user: 'root',      //  db username
  password: '1234', //  db password
  database: 'offer_alert_system'
}).promise();

// --- API ROUTES ---

// Login User
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (isPasswordCorrect) {
      const { password_hash, ...userData } = user;
      res.status(200).json({ user: userData });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// --- API ROUTE TO ADD A NEW PRODUCT WITH SOURCES ---
app.post('/api/products', async (req, res) => {
  // Get data from the request body
  const { productName, sources, userId } = req.body;

  // Validation
  if (!productName || !sources || !userId || !Array.isArray(sources) || sources.length === 0) {
    return res.status(400).json({ message: 'Invalid product data provided.' });
  }

  const connection = await pool.getConnection(); // Get a connection from the pool

  try {
    await connection.beginTransaction(); 

    // 1. Insert the main product
    const productSql = 'INSERT INTO products (name, user_id) VALUES (?, ?)';
    const [productResult] = await connection.execute(productSql, [productName, userId]);
    const newProductId = productResult.insertId;

    // 2. Insert each source linked to the new product
    const sourceSql = `
      INSERT INTO product_sources (product_id, name, price, start_date, end_date, alerts_enabled, is_offer)
      VALUES ?
    `;
    
    const sourceValues = sources.map(source => [
      newProductId,
      source.name,
      source.price,
      source.isOffer ? source.startDate : null,
      source.isOffer ? source.endDate : null,
      source.alertsEnabled,
      source.isOffer
    ]);

    await connection.query(sourceSql, [sourceValues]);

    await connection.commit(); // Commit the transaction if all queries succeed

    res.status(201).json({ message: 'Product added successfully', productId: newProductId });

  } catch (error) {
    await connection.rollback(); // Roll back the transaction if any query fails
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product.' });
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});

// Get All Users (for Admin page)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, full_name, email, role, created_at FROM users");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Get All Products (example)
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});


// --- Start Server ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});