import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(path.resolve("packages/db/package.json"));
const { Client } = require("pg");

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
}

interface ConstraintInfo {
  table_name: string;
  column_name: string;
  constraint_type: string;
}

async function fetchColumns(client: Client): Promise<ColumnInfo[]> {
  const query = `
    SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;
  const result = await client.query(query);
  return result.rows;
}

async function fetchConstraints(client: Client): Promise<ConstraintInfo[]> {
  const query = `
    SELECT tc.table_name, kcu.column_name, tc.constraint_type
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public';
  `;
  const result = await client.query(query);
  return result.rows;
}

async function runIntrospection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    process.stderr.write("DATABASE_URL environment variable is required\n");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const columns = await fetchColumns(client);
    const constraints = await fetchConstraints(client);

    const tables: Record<string, any[]> = {};
    for (const col of columns) {
      if (!tables[col.table_name]) {
        tables[col.table_name] = [];
      }
      const isPk = constraints.some(
        (c) =>
          c.table_name === col.table_name &&
          c.column_name === col.column_name &&
          c.constraint_type === "PRIMARY KEY",
      );
      tables[col.table_name].push({
        column: col.column_name,
        type: col.data_type,
        udt: col.udt_name,
        nullable: col.is_nullable === "YES",
        default: col.column_default,
        primaryKey: isPk,
      });
    }

    const indexesQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'listing';
    `;
    const fkQuery = `
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE n.nspname = 'public' AND t.relname = 'listing';
    `;
    const indexes = await client.query(indexesQuery);
    const tableConstraints = await client.query(fkQuery);

    process.stdout.write(
      JSON.stringify(
        {
          tables,
          listingIndexes: indexes.rows,
          listingConstraints: tableConstraints.rows,
        },
        null,
        2,
      ) + "\n",
    );
  } finally {
    await client.end();
  }
}

runIntrospection().catch((error) => {
  process.stderr.write(`Introspection failed: ${error.message}\n`);
  process.exit(1);
});
