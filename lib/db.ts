import postgres from 'postgres';

// Konfiguration für die Neon Postgres-Verbindung
const sql = postgres({
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
        options: `--cluster=${process.env.POSTGRES_HOST}`,
    },
    // Connection-Pooling Konfiguration
    max: 10, // maximale Anzahl gleichzeitiger Verbindungen
    idle_timeout: 20, // Timeout für inaktive Verbindungen in Sekunden
    connect_timeout: 10, // Verbindungs-Timeout in Sekunden
});

export type Measurement = {
    id: string;
    timestamp: Date;
    channel1?: number;
    channel2?: number;
    channel3?: number;
};

export type Metadata = {
    id: string;
    measurement_id: string;
    filename: string;
    created_at: Date;
    description?: string;
};

/**
 * Fügt neue Messdaten in die Datenbank ein
 */
export async function insertMeasurement(measurement: Omit<Measurement, 'id'>) {
    const result = await sql`
        INSERT INTO measurements (
            timestamp,
            channel1,
            channel2,
            channel3
        ) VALUES (
            ${measurement.timestamp},
            ${measurement.channel1 || null},
            ${measurement.channel2 || null},
            ${measurement.channel3 || null}
        )
        RETURNING id
    `;
    return result[0].id;
}

/**
 * Fügt Metadaten für eine Messung ein
 */
export async function insertMetadata(metadata: Omit<Metadata, 'id'>) {
    const result = await sql`
        INSERT INTO metadata (
            measurement_id,
            filename,
            created_at,
            description
        ) VALUES (
            ${metadata.measurement_id},
            ${metadata.filename},
            ${metadata.created_at},
            ${metadata.description || null}
        )
        RETURNING id
    `;
    return result[0].id;
}

/**
 * Holt Messdaten für einen bestimmten Zeitraum
 */
export async function getMeasurements(startTime: Date, endTime: Date) {
    return await sql<Measurement[]>`
        SELECT *
        FROM measurements
        WHERE timestamp BETWEEN ${startTime} AND ${endTime}
        ORDER BY timestamp ASC
    `;
}

/**
 * Holt Metadaten für eine bestimmte Messung
 */
export async function getMetadata(measurementId: string) {
    return await sql<Metadata[]>`
        SELECT *
        FROM metadata
        WHERE measurement_id = ${measurementId}
    `;
}

export default sql;