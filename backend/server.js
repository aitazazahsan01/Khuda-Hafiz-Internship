import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURATION & MIDDLEWARE ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234', // Ensure this is your correct password
  database: 'offer_alert_system'
});

// --- AUTHENTICATION MIDDLEWARE ---

// Middleware 1: Checks if a token is valid and attaches user to the request
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware 2: Checks if the authenticated user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

// --- API ROUTES ---

// --- Authentication API ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (isPasswordCorrect) {
      const { password_hash, ...userData } = user;
      const token = jwt.sign({ id: userData.id, email: userData.email, role: userData.role }, JWT_SECRET, { expiresIn: '1d' });
      res.status(200).json({ user: userData, token: token });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Products API ---

// GET All Products
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id, p.name as productName, p.is_archived as isArchived, p.created_at as createdAt, 
        p.updated_at as updatedAt, p.user_id as createdBy, p.category_id as categoryId,
        ps.id as sourceId, ps.name as sourceName, ps.price, ps.start_date as startDate, 
        ps.end_date as endDate, ps.alerts_enabled as alertsEnabled, ps.is_offer as isOffer,
        u.full_name as creatorName,
        c.name as categoryName
      FROM products p
      LEFT JOIN product_sources ps ON p.id = ps.product_id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC, ps.id ASC;
    `;
    const [rows] = await pool.query(sql);
    const productsMap = new Map();
    for (const row of rows) {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id, productName: row.productName, isArchived: !!row.isArchived,
          createdAt: row.createdAt, updatedAt: row.updatedAt, createdBy: row.createdBy,
          creatorName: row.creatorName || 'Unknown', categoryId: row.categoryId,
          categoryName: row.categoryName || 'Uncategorized', sources: [],
        });
      }
      if (row.sourceId) {
        productsMap.get(row.id).sources.push({
          id: row.sourceId, name: row.sourceName, sourceName: row.sourceName,
          price: parseFloat(row.price), startDate: row.startDate, endDate: row.endDate,
          alertsEnabled: !!row.alertsEnabled, isOffer: !!row.isOffer,
        });
      }
    }
    res.status(200).json(Array.from(productsMap.values()));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});


// POST a new Product (Corrected)
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
  const { productName, sources, userId, categoryId } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const productSql = 'INSERT INTO products (name, user_id, category_id) VALUES (?, ?, ?)';
    // THIS LINE IS CHANGED to better handle empty categoryId
    const [productResult] = await connection.execute(productSql, [productName, userId, categoryId ? categoryId : null]);
    const newProductId = productResult.insertId;
    if (sources && sources.length > 0) {
      const sourceSql = `INSERT INTO product_sources (product_id, name, price, start_date, end_date, alerts_enabled, is_offer) VALUES ?`;
      const sourceValues = sources.map(s => [newProductId, s.name, s.price, s.isOffer ? s.startDate : null, s.isOffer ? s.endDate : null, s.alertsEnabled, s.isOffer]);
      await connection.query(sourceSql, [sourceValues]);
    }
    await connection.commit();
    res.status(201).json({ message: 'Product added successfully', productId: newProductId });
  } catch (error) {
    await connection.rollback();
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product.' });
  } finally {
    connection.release();
  }
});

// PUT (Update) a Product (Corrected)
app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { productName, sources, categoryId } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const productSql = 'UPDATE products SET name = ?, category_id = ? WHERE id = ?';
    // THIS LINE IS CHANGED to better handle empty categoryId
    await connection.execute(productSql, [productName, categoryId ? categoryId : null, id]);
    await connection.execute('DELETE FROM product_sources WHERE product_id = ?', [id]);
    if (sources && sources.length > 0) {
      const sourceSql = `INSERT INTO product_sources (product_id, name, price, start_date, end_date, alerts_enabled, is_offer) VALUES ?`;
      const sourceValues = sources.map(s => [id, s.name, s.price, s.isOffer ? s.startDate : null, s.isOffer ? s.endDate : null, s.alertsEnabled, s.isOffer]);
      await connection.query(sourceSql, [sourceValues]);
    }
    await connection.commit();
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product.' });
  } finally {
    connection.release();
  }
});

// DELETE a Product
app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// PATCH (Archive/Unarchive) a Product
app.patch('/api/products/:id/archive', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { isArchived } = req.body;
  if (typeof isArchived !== 'boolean') {
    return res.status(400).json({ message: 'isArchived (boolean) is required.' });
  }
  try {
    await pool.execute('UPDATE products SET is_archived = ? WHERE id = ?', [isArchived, id]);
    res.status(200).json({ message: `Product status updated` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update archive status.' });
  }
});

// --- Users API ---

// GET All Users
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, full_name, email, role, created_at FROM users");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// POST (Create) a new User
app.post('/api/users', authenticateToken, isAdmin, async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserId = uuidv4();
    const sql = 'INSERT INTO users (id, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)';
    await pool.execute(sql, [newUserId, fullName, email, hashedPassword, role]);
    const [rows] = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [newUserId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

// PUT (Update) a User
app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { fullName, role } = req.body;
  if (!fullName || !role) {
    return res.status(400).json({ message: 'Full name and role are required.' });
  }
  try {
    const sql = 'UPDATE users SET full_name = ?, role = ? WHERE id = ?';
    await pool.execute(sql, [fullName, role, id]);
    const [rows] = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// DELETE a User
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) {
    return res.status(400).json({ message: 'Cannot delete your own admin account.' });
  }
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// --- Categories API ---

// GET All Categories
app.get('/api/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [categories] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// POST (Create) a new Category
app.post('/api/categories', authenticateToken, isAdmin, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }
  try {
    const sql = 'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [name, description, userId]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category.' });
  }
});

// PUT (Update) a Category
app.put('/api/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required.' });
  }
  try {
    const sql = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    await pool.execute(sql, [name, description, id]);
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category.' });
  }
});

// DELETE a Category
app.delete('/api/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
});


// --- Calculator Settings API ---

// GET the calculator settings
app.get('/api/settings/calculator', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM calculator_settings WHERE id = 1");
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found.' });
    }
    const dbSettings = rows[0];
    const settings = {
      id: dbSettings.id, platformCommission: dbSettings.platform_commission,
      vatRate: dbSettings.vat_rate, shippingThreshold: dbSettings.shipping_threshold,
      shippingFee: dbSettings.shipping_fee, fullShippingCost: dbSettings.full_shipping_cost,
      creatorCommission: dbSettings.creator_commission, updatedAt: dbSettings.updated_at,
      updatedBy: dbSettings.updated_by,
    };
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings.' });
  }
});

// PUT (Update) the calculator settings
app.put('/api/settings/calculator', authenticateToken, isAdmin, async (req, res) => {
  const settings = req.body;
  const userId = req.user.id;
  try {
    const sql = `
      UPDATE calculator_settings SET 
        platform_commission = ?, vat_rate = ?, shipping_threshold = ?, 
        shipping_fee = ?, full_shipping_cost = ?, creator_commission = ?, 
        updated_by = ? 
      WHERE id = 1
    `;
    await pool.execute(sql, [
      settings.platformCommission, settings.vatRate, settings.shippingThreshold,
      settings.shippingFee, settings.fullShippingCost, settings.creatorCommission,
      userId
    ]);
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: 'Failed to update settings.' });
  }
});


// --- START SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});