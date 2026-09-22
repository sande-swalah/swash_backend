class User {
  constructor({ id, email, role, passwordHash }) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.passwordHash = passwordHash;
  }

  static isValidRole(role) {
    return ['owner', 'employee', 'tenant'].includes(role);
  }

  static normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  static fromDb(row) {
    if (!row) return null;

    return new User({
      id: row.id,
      email: row.email,
      role: row.role,
      passwordHash: row.password_hash,
    });
  }
}

module.exports = User;
