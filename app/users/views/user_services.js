


/**
 * UserServices class provides methods to interact with user-related data in the database and Redis cache.
 */

class UserServices {
  constructor(db, redisClient) {
    this.db = db;
    this.redisClient = redisClient;
  }

  async createUser({ email, passwordHash, role }) {
    const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role
    `;

    const result = await this.db.query(query, [email, passwordHash, role]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, role
      FROM users
      WHERE email = $1
    `;

    const result = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const query = `
      SELECT id, email, role
      FROM users
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async getAllUsers() {
    const query = `
      SELECT id, email, role
      FROM users
      ORDER BY id ASC
    `;

    const result = await this.db.query(query);
    return result.rows;
  }
}

module.exports = UserServices;

