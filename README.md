# Swash Backend

Node.js backend for the Swash rental management system.

## Stack

- Node.js
- Express
- PostgreSQL
- Redis
- `node-pg-migrate`
- JWT auth
- bcrypt password hashing

## Prerequisites

- Node.js installed
- PostgreSQL installed and running
- Redis installed and running (optional for cache usage)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your local PostgreSQL and JWT values.

   Example:

   ```env
   PGUSER=postgres
   PGHOST=localhost
   PGDATABASE=swashdatabase
   PGPASSWORD=your_password_here
   PGPORT=5432

   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1h

   SEED_OWNER_EMAIL=owner@swash.com
   SEED_OWNER_PASSWORD=OwnerPassword123!
   ```

## Database migrations

Run pending migrations:

```bash
npm run migrate -- up
```

Create a new migration:

```bash
npm run migrate:create -- add_something
```

Rollback the latest migration:

```bash
npm run migrate -- down
```

## Health check

```bash
npm run health-check
```

This confirms the app can connect to PostgreSQL.

## Seed the default owner

```bash
npm run seed:owner
```

This creates a default owner user if one does not already exist.

Default account:

- Email: `owner@swash.com`
- Password: `OwnerPassword123!`

## Run the app

```bash
node index.js
```

The API runs on:

```text
http://localhost:3000
```

## API routes

### Public

```http
POST /api/users/login
```

### Protected

```http
POST /api/users/register
GET /api/users/me
```

Registration is restricted to authenticated owners only.

## Notes

- No public self-signup is allowed in this closed system.
- Only owner users can create tenant or employee accounts.
- Tenant accounts are created by the owner/admin and logged in only after invitation or assignment.
