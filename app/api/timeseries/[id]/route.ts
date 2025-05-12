import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Hilfstypen für TypeScript
interface TimeseriesData {
  timestamp: string;
  channel1: number;
  channel2: number;
  channel3: number;
}

interface TimeseriesMetadata {
  id: string;
  filename: string;
  created_at: string;
  description: string | null;
}

interface TimeseriesResponse {
  metadata: TimeseriesMetadata;
  data: TimeseriesData[];
}

// Handler für GET /api/timeseries/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true
      }
    });

    await client.connect();

    // Hole Metadaten und Messwerte für die angegebene ID
    const metadataResult = await client.query(
      `SELECT id, filename, created_at, description 
       FROM metadata 
       WHERE measurement_id = $1`,
      [params.id]
    );

    if (metadataResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Zeitreihe nicht gefunden' },
        { status: 404 }
      );
    }

    const dataResult = await client.query(
      `SELECT timestamp, channel1, channel2, channel3 
       FROM measurements 
       WHERE id = $1 
       ORDER BY timestamp ASC`,
      [params.id]
    );

    await client.end();

    const response: TimeseriesResponse = {
      metadata: metadataResult.rows[0],
      data: dataResult.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
