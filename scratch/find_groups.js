const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const client = new Client({
  connectionString: env.DATABASE_URL
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL database');
  
  // List all tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
  `);
  console.log('Tables in public schema:', tablesRes.rows.map(r => r.table_name));

  // Query groups table
  try {
    const groupsRes = await client.query('SELECT * FROM groups');
    console.log('\n--- GROUPS FOUND ---');
    console.log(JSON.stringify(groupsRes.rows, null, 2));
  } catch (err) {
    console.error('Error querying groups table:', err);
  }

  // Also query pilgrims to see if any pilgrim is in a group or what groups exist there
  try {
    const pilgrimsRes = await client.query('SELECT id, first_name, last_name, group_id FROM pilgrims');
    console.log('\n--- PILGRIMS AND THEIR GROUP_IDs ---');
    console.log(JSON.stringify(pilgrimsRes.rows, null, 2));
  } catch (err) {
    console.error('Error querying pilgrims table:', err);
  }

  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
