require('dotenv').config();
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

console.log('Connecting with:', process.env.DATABASE_URL_UNPOOLED?.replace(/:([^:@]+)@/, ':***@'));

const client = new Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  ssl: {
    rejectUnauthorized: true
  }
});

// Beispieldaten generieren
function generateSampleData(numPoints = 100) {
  const data = [];
  const startTime = new Date('2025-05-12T00:00:00Z');
  
  for (let i = 0; i < numPoints; i++) {
    const timestamp = new Date(startTime.getTime() + i * 60000); // Eine Minute Intervall
    data.push({
      id: uuidv4(), // Individuelle ID für jeden Messpunkt
      timestamp: timestamp.toISOString(),
      channel1: Math.sin(i * 0.1) * 10,  // Sinuswelle
      channel2: Math.random() * 5,        // Zufälliges Rauschen
      channel3: i * 0.1                   // Linearer Anstieg
    });
  }
  
  return data;
}

async function insertSampleData() {
  try {    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');

    console.log('Generating sample data...');

    const sampleData = generateSampleData();
    const firstPointId = sampleData[0].id;    // Füge alle Messpunkte ein
    console.log('Inserting measurement points...');
    for (const point of sampleData) {
      await client.query(
        `INSERT INTO measurements (id, timestamp, channel1, channel2, channel3)
         VALUES ($1, $2, $3, $4, $5)`,
        [point.id, point.timestamp, point.channel1, point.channel2, point.channel3]
      );
    }
    console.log('Inserted', sampleData.length, 'measurement points');

    // Füge die Metadaten für den Datensatz ein
    await client.query(
      `INSERT INTO metadata (measurement_id, filename, created_at, description)
       VALUES ($1, $2, $3, $4)`,
      [
        firstPointId,
        'example_data.csv',
        new Date().toISOString(),
        'Beispieldatensatz mit Sinuswelle, Rauschen und linearem Anstieg'
      ]
    );

    console.log('Sample data inserted successfully');
    console.log('Dataset ID:', firstPointId);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

insertSampleData();
