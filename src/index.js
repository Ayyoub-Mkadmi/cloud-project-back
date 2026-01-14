const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');

console.log({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/games', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM games ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM games WHERE id = $1', [id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

app.post('/api/games', upload.single('image'), async (req, res) => {
  try {
    const { name, description, videoUrls } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Simulate S3 by returning a full URL when S3_BASE_URL is set.
    // Example: S3_BASE_URL=https://s3.local/bucket-name
    let imageUrl = null;
    if (req.file) {
      const filename = req.file.filename;
      const s3Base = process.env.S3_BASE_URL && String(process.env.S3_BASE_URL).trim();
      if (s3Base) {
        imageUrl = `${s3Base.replace(/\/$/, '')}/${filename}`;
      } else {
        imageUrl = `/uploads/${filename}`;
      }
    }
    let videosJson = null;
    if (videoUrls) {
      try {
        videosJson = JSON.parse(videoUrls);
      } catch (e) {
        // accept comma-separated string
        videosJson = String(videoUrls).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const result = await db.query(
      `INSERT INTO games (name, description, image_url, video_urls)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || null, imageUrl, videosJson ? JSON.stringify(videosJson) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server and DB connections...`);
  server.close(() => {
    console.log('HTTP server closed.');
    db.pool.end(() => {
      console.log('Database pool closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
