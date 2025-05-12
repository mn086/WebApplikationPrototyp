-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Measurements table
CREATE TABLE IF NOT EXISTS measurements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    channel1 FLOAT,
    channel2 FLOAT,
    channel3 FLOAT
);

-- Metadata table
CREATE TABLE IF NOT EXISTS metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    measurement_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    description TEXT
);

-- Index für schnellere Zeitreihen-Abfragen
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements(timestamp);

-- Index für die Verknüpfung zwischen Measurements und Metadata
CREATE INDEX IF NOT EXISTS idx_metadata_measurement_id ON metadata(measurement_id);