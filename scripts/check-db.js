require('dotenv').config();
const { Client } = require('pg');

// Log connection string (without password)
const connectionString = process.env.DATABASE_URL_UNPOOLED;
console.log('Connection string:', connectionString?.replace(/:([^:@]+)@/, ':***@'));

// Create a new client
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: true
  }
});

async function checkDb() {
  try {
    console.log('Connecting to database...');
    // Connect to the database
    await client.connect();
    console.log('Successfully connected to database');

    // Check for tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `);

    const tables = result.rows.map(row => row.table_name);
    console.log('Found tables:', tables);

    // Check table structures
    for (const table of tables) {
      const columns = await client.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
      `, [table]);
      
      console.log(`\nStructure of table '${table}':`);
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
      });
    }
  } catch (err) {
    console.error('Database Error:', err);
    process.exit(1);
  } finally {
    try {
      // Close the connection
      await client.end();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
      process.exit(1);
    }
  }
}

checkDb();
