require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./utils/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mount
app.use('/api/auth', require('./routes/auth'));
app.use('/api/music', require('./routes/music'));
app.use('/api/library', require('./routes/library'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: db.isConnected() ? 'mongodb' : 'json_fallback',
    time: new Date() 
  });
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/moody_player';
db.connect(MONGODB_URI);

// Port configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Moody Player Backend running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'An internal server error occurred' });
});
