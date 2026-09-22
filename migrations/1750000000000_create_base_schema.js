exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('user_role', ['owner', 'employee', 'tenant']);

  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    role: { type: 'user_role', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('properties', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'text', notNull: true },
    owner_id: {
      type: 'integer',
      notNull: true,
      references: 'users',
      onDelete: 'RESTRICT',
    },
  });

  pgm.createTable('units', {
    id: { type: 'serial', primaryKey: true },
    property_id: {
      type: 'integer',
      notNull: true,
      references: 'properties',
      onDelete: 'CASCADE',
    },
    unit_number: { type: 'varchar(50)', notNull: true },
    rent_amount: { type: 'numeric(10,2)', notNull: true },
  });

  pgm.createTable('tenant_profiles', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      unique: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    unit_id: {
      type: 'integer',
      notNull: true,
      references: 'units',
      onDelete: 'RESTRICT',
    },
  });

  pgm.createTable('bills', {
    id: { type: 'serial', primaryKey: true },
    unit_id: {
      type: 'integer',
      notNull: true,
      references: 'units',
      onDelete: 'CASCADE',
    },
    amount: { type: 'numeric(10,2)', notNull: true },
    type: { type: 'varchar(20)', notNull: true },
    status: { type: 'varchar(20)', notNull: true },
    due_date: { type: 'date', notNull: true },
  });

  pgm.createTable('repairs', {
    id: { type: 'serial', primaryKey: true },
    unit_id: {
      type: 'integer',
      notNull: true,
      references: 'units',
      onDelete: 'CASCADE',
    },
    description: { type: 'text', notNull: true },
    status: { type: 'varchar(30)', notNull: true },
    assigned_employee_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL',
    },
  });

  pgm.createFunction(
    'check_property_owner_role',
    [],
    {
      language: 'plpgsql',
      returns: 'trigger',
    },
    `
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM users WHERE id = NEW.owner_id AND role = 'owner'
        ) THEN
          RAISE EXCEPTION 'properties.owner_id must reference a user with role = owner';
        END IF;
        RETURN NEW;
      END;
    `
  );

  pgm.createTrigger('properties', 'trg_check_property_owner_role', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    function: 'check_property_owner_role',
    level: 'ROW',
  });

  pgm.createFunction(
    'check_tenant_profile_role',
    [],
    {
      language: 'plpgsql',
      returns: 'trigger',
    },
    `
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM users WHERE id = NEW.user_id AND role = 'tenant'
        ) THEN
          RAISE EXCEPTION 'tenant_profiles.user_id must reference a user with role = tenant';
        END IF;
        RETURN NEW;
      END;
    `
  );

  pgm.createTrigger('tenant_profiles', 'trg_check_tenant_profile_role', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    function: 'check_tenant_profile_role',
    level: 'ROW',
  });

  pgm.createFunction(
    'check_repair_employee_role',
    [],
    {
      language: 'plpgsql',
      returns: 'trigger',
    },
    `
      BEGIN
        IF NEW.assigned_employee_id IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM users WHERE id = NEW.assigned_employee_id AND role = 'employee'
        ) THEN
          RAISE EXCEPTION 'repairs.assigned_employee_id must reference a user with role = employee';
        END IF;
        RETURN NEW;
      END;
    `
  );

  pgm.createTrigger('repairs', 'trg_check_repair_employee_role', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    function: 'check_repair_employee_role',
    level: 'ROW',
  });
};

exports.down = (pgm) => {
  pgm.dropTrigger('repairs', 'trg_check_repair_employee_role');
  pgm.dropFunction('check_repair_employee_role', []);

  pgm.dropTrigger('tenant_profiles', 'trg_check_tenant_profile_role');
  pgm.dropFunction('check_tenant_profile_role', []);

  pgm.dropTrigger('properties', 'trg_check_property_owner_role');
  pgm.dropFunction('check_property_owner_role', []);

  pgm.dropTable('repairs', { ifExists: true });
  pgm.dropTable('bills', { ifExists: true });
  pgm.dropTable('tenant_profiles', { ifExists: true });
  pgm.dropTable('units', { ifExists: true });
  pgm.dropTable('properties', { ifExists: true });
  pgm.dropTable('users', { ifExists: true });
  pgm.dropType('user_role', { ifExists: true });
};
