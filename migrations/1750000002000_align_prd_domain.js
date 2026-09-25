exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('units', {
    is_occupied: { type: 'boolean', notNull: true, default: false },
  });
  pgm.addColumn('repairs', {
    cost: { type: 'numeric(10,2)' },
    photos: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
  });
  pgm.addConstraint('repairs', 'repairs_cost_non_negative', { check: 'cost IS NULL OR cost >= 0' });
  pgm.dropConstraint('repairs', 'repairs_status_valid');
  pgm.addConstraint('repairs', 'repairs_status_valid', {
    check: "status IN ('pending', 'open', 'assigned', 'in_progress', 'resolved', 'completed', 'cancelled')",
  });
  pgm.addConstraint('bills', 'bills_type_valid', {
    check: "type IN ('rent', 'water', 'electricity', 'wifi')",
  });

  pgm.createTable('invitations', {
    id: { type: 'serial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true },
    role: { type: 'user_role', notNull: true },
    property_id: { type: 'integer', references: 'properties', onDelete: 'CASCADE' },
    unit_id: { type: 'integer', references: 'units', onDelete: 'CASCADE' },
    invited_by: { type: 'integer', notNull: true, references: 'users', onDelete: 'CASCADE' },
    code: { type: 'varchar(64)', notNull: true, unique: true },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    expires_at: { type: 'timestamp', notNull: true },
    accepted_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('invitations', 'invitations_status_valid', {
    check: "status IN ('pending', 'accepted', 'expired', 'revoked')",
  });
  pgm.addConstraint('invitations', 'invitations_role_target_valid', {
    check: "(role = 'tenant' AND unit_id IS NOT NULL) OR (role = 'employee' AND property_id IS NOT NULL)",
  });
  pgm.createIndex('invitations', ['email', 'status']);
};

exports.down = (pgm) => {
  pgm.dropTable('invitations', { ifExists: true });
  pgm.dropConstraint('bills', 'bills_type_valid');
  pgm.dropConstraint('repairs', 'repairs_status_valid');
  pgm.addConstraint('repairs', 'repairs_status_valid', {
    check: "status IN ('open', 'assigned', 'in_progress', 'resolved', 'cancelled')",
  });
  pgm.dropConstraint('repairs', 'repairs_cost_non_negative');
  pgm.dropColumn('repairs', ['cost', 'photos']);
  pgm.dropColumn('units', 'is_occupied');
};