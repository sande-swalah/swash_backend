require('dotenv').config();
const pool = require('../db');

async function runHealthCheck() {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    console.log('Health check passed');
    console.log(JSON.stringify({ status: 'ok', database: 'connected', time: result.rows[0].now }, null, 2));
  } catch (error) {
    console.error('Health check failed');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
}

runHealthCheck();
