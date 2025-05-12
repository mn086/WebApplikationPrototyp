require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the schema file
const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

// Create a new client
const client = new Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED
});

async function initDb() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');

    // Execute the schema
    await client.query(schema);
    console.log('Schema executed successfully');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    await client.end();
  }
}

initDb();
