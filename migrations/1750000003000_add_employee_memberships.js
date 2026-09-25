exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('employee_properties', {
    id: { type: 'serial', primaryKey: true },
    employee_id: { type: 'integer', notNull: true, references: 'users', onDelete: 'CASCADE' },
    property_id: { type: 'integer', notNull: true, references: 'properties', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('employee_properties', 'employee_properties_unique', {
    unique: ['employee_id', 'property_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('employee_properties', { ifExists: true });
};