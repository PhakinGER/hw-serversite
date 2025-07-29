const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

const pool = mysql.createPool(dbConfig);

app.get('/', (req, res) => {
  const imageUrl = 'https://stickershop.line-scdn.net/stickershop/v1/product/1202789/LINEStorePC/main.png?v=1';
  res.send(`
    <html>
      <head>
        <title>สวัสดีงับ</title>
      </head>
      <body style="text-align: center; font-family: sans-serif;">
        <h1>สวัสดีงับ</h1>
        <img src="${imageUrl}" alt="sticker" style="max-width: 300px;" />
        <h1>ลองใส่</h1>
        <h1>/products</h1>
        <h1>/products/(1-4)</h1>
        <h1>/products/search/(ชื่อสินค้า)</h1>
      </body>
    </html>
  `);
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE is_deleted = FALSE');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลสินค้าบ่ได้สู' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ? AND is_deleted = FALSE',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่เจอสินค้านะจ๊ะ' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลสินค้าบ่ได้สู' });
  }
});

app.get('/products/search/:keyword', async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE name LIKE ? AND is_deleted = FALSE',
      [keyword]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'ไม่เจอสินค้างับ' });
  }
});

app.post('/products', async (req, res) => {
  const { name, price } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name, price]
    );
    res.status(201).json({ message: 'เย่ะเพิ่มสินค้าเรียบร้อยแนะ', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'แงะเพิ่มสินค้าไม่สำเร็จ' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { name, price } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, price = ? WHERE id = ? AND is_deleted = FALSE',
      [name, price, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้าที่แก้ไขอะ' });
    }
    res.json({ message: 'แก้ไขสินค้าเรียบร้อยแน้ว' });
  } catch (error) {
    res.status(500).json({ error: 'แก้ไขสินค้าไม่สำเร็จ' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE products SET is_deleted = TRUE WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่มีสินค้าที่จะลบแฮะ' });
    }
    res.json({ message: 'ลบสินค้าเรียบร้อยละเตง (soft delete)' });
  } catch (error) {
    res.status(500).json({ error: 'ลบสินค้าไม่ได้ง่ะ' });
  }
});

app.put('/products/restore/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE products SET is_deleted = FALSE WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่มีสินค้าที่จะกู้นะเตง' });
    }
    res.json({ message: 'กู้คืนสินค้าเรียบร้อยแล้วงับ' });
  } catch (error) {
    res.status(500).json({ error: 'กู้คืนสินค้าไม่สำเร็จ' });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
