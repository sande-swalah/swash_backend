const client = require('./db');

async function run() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');

        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
    } catch (error) {
        console.error('Database error:', error.message);
        process.exitCode = 1;
    } finally {
        await client.end().catch(() => {});
    }
}

run();