const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
        <h1>ดูจิชื่อสินค้า)</h1>
      </body>
    </html>
  `);
});

app.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลสินค้าบ่ได้สู' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่สินค้า id นี้นะเตง' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลสินค้าบ่ได้สู' });
  }
});

app.get('/products/search/:keyword', async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;
    const [rows] = await pool.execute('SELECT * FROM products WHERE name LIKE ?', [keyword]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'ไม่เจอสินค้างับ' });
  }
});

app.listen(3000, ( ) => console.log(`http://localhost:${PORT}`))
