exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('units', 'units_property_unit_number_unique', {
    unique: ['property_id', 'unit_number'],
  });
  pgm.addConstraint('units', 'units_rent_amount_positive', {
    check: 'rent_amount > 0',
  });
  pgm.addConstraint('bills', 'bills_amount_positive', {
    check: 'amount > 0',
  });
  pgm.addConstraint('bills', 'bills_status_valid', {
    check: "status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')",
  });
  pgm.addConstraint('repairs', 'repairs_status_valid', {
    check: "status IN ('open', 'assigned', 'in_progress', 'resolved', 'cancelled')",
  });

  pgm.createTable('payments', {
    id: { type: 'serial', primaryKey: true },
    bill_id: {
      type: 'integer',
      notNull: true,
      references: 'bills',
      onDelete: 'RESTRICT',
    },
    tenant_user_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
    amount: { type: 'numeric(10,2)', notNull: true },
    provider: { type: 'varchar(30)', notNull: true, default: 'manual' },
    reference: { type: 'varchar(120)', notNull: true, unique: true },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    paid_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('payments', 'payments_amount_positive', { check: 'amount > 0' });
  pgm.addConstraint('payments', 'payments_status_valid', {
    check: "status IN ('pending', 'confirmed', 'failed', 'reversed')",
  });

  pgm.createTable('alerts', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true, references: 'users', onDelete: 'CASCADE' },
    type: { type: 'varchar(40)', notNull: true },
    title: { type: 'varchar(160)', notNull: true },
    message: { type: 'text', notNull: true },
    read_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.createIndex('alerts', ['user_id', 'read_at', 'created_at']);
  pgm.createIndex('payments', ['bill_id', 'status']);
};

exports.down = (pgm) => {
  pgm.dropTable('alerts', { ifExists: true });
  pgm.dropTable('payments', { ifExists: true });
  pgm.dropConstraint('repairs', 'repairs_status_valid');
  pgm.dropConstraint('bills', 'bills_status_valid');
  pgm.dropConstraint('bills', 'bills_amount_positive');
  pgm.dropConstraint('units', 'units_rent_amount_positive');
  pgm.dropConstraint('units', 'units_property_unit_number_unique');
};