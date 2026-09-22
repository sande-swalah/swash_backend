require('dotenv').config();

const express = require('express');
const userRoutes = require('./app/users/controller/user_routes');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.use('/api/users', userRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('PostgreSQL pool closed');
      process.exit(0);
    } catch (error) {
      console.error('Error closing PostgreSQL pool:', error.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
