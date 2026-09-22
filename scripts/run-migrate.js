#!/usr/bin/env node
require('dotenv').config();

const { spawnSync } = require('child_process');

const command = process.argv[2] || 'up';
const requiredEnvVars = ['PGUSER', 'PGHOST', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required DB env vars: ${missingEnvVars.join(', ')}`);
}

const url = new URL(`postgres://${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`);
url.username = process.env.PGUSER;
url.password = process.env.PGPASSWORD;

const result = spawnSync(
  'npx',
  ['node-pg-migrate', command, '--migrations-dir', './migrations', '--database-url', url.toString()],
  {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
