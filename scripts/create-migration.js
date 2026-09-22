#!/usr/bin/env node
require('dotenv').config();

const { spawnSync } = require('child_process');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: npm run migrate:create -- <migration-name>');
  process.exit(1);
}

const result = spawnSync(
  'npx',
  ['node-pg-migrate', 'create', migrationName, '--migrations-dir', './migrations'],
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
