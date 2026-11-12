exports.up = async (knex) => {
  await knex.schema.createTable('accounts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('owner_type').notNullable(); // USER or SYSTEM
    t.string('owner_id').notNullable();   // Mongo user id, or the system account name
    t.string('currency', 3).notNullable().defaultTo('NGN');
    t.bigInteger('balance_kobo').notNullable().defaultTo(0);
    t.string('status').notNullable().defaultTo('ACTIVE');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['owner_type', 'owner_id', 'currency']);
  });

  await knex.raw(`
    ALTER TABLE accounts
    ADD CONSTRAINT accounts_owner_type_check CHECK (owner_type IN ('USER', 'SYSTEM')),
    ADD CONSTRAINT accounts_status_check CHECK (status IN ('ACTIVE', 'FROZEN')),
    ADD CONSTRAINT accounts_user_balance_check CHECK (owner_type <> 'USER' OR balance_kobo >= 0)
  `);

  await knex.schema.createTable('transactions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('reference').notNullable().unique();
    t.string('type').notNullable();
    t.string('status').notNullable().defaultTo('COMPLETED');
    t.string('idempotency_key').unique();
    t.jsonb('metadata').notNullable().defaultTo('{}');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('ledger_entries', (t) => {
    t.bigIncrements('id');
    t.uuid('transaction_id').notNullable().references('id').inTable('transactions');
    t.uuid('account_id').notNullable().references('id').inTable('accounts');
    t.string('direction').notNullable();
    t.bigInteger('amount_kobo').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index('account_id');
    t.index('transaction_id');
  });

  await knex.raw(`
    ALTER TABLE ledger_entries
    ADD CONSTRAINT ledger_direction_check CHECK (direction IN ('debit', 'credit')),
    ADD CONSTRAINT ledger_amount_check CHECK (amount_kobo > 0)
  `);

  // Ledger is append-only: the database itself refuses UPDATE and DELETE
  await knex.raw(`
    CREATE FUNCTION ledger_entries_immutable() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'ledger_entries is append-only';
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER ledger_entries_no_update_delete
    BEFORE UPDATE OR DELETE ON ledger_entries
    FOR EACH ROW EXECUTE FUNCTION ledger_entries_immutable();
  `);
};

exports.down = async (knex) => {
  await knex.raw('DROP TRIGGER IF EXISTS ledger_entries_no_update_delete ON ledger_entries');
  await knex.raw('DROP FUNCTION IF EXISTS ledger_entries_immutable()');
  await knex.schema.dropTableIfExists('ledger_entries');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('accounts');
};