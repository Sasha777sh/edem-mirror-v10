#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Get database connection details from DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
}

// Read the migration file
const migrationPath = path.resolve(__dirname, '../src/migrations/007_edem_living_llm.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Create a temporary file with the migration SQL
const tempSqlFile = path.resolve(__dirname, '../temp_migration.sql');
fs.writeFileSync(tempSqlFile, migrationSql);

try {
    // Apply the migration using psql
    console.log('Applying EDEM Living LLM migration...');
    execSync(`psql "${databaseUrl}" -f "${tempSqlFile}"`, { stdio: 'inherit' });
    console.log('EDEM Living LLM migration applied successfully!');
} catch (error) {
    console.error('Error applying migration:', error.message);
    process.exit(1);
} finally {
    // Clean up temporary file
    if (fs.existsSync(tempSqlFile)) {
        fs.unlinkSync(tempSqlFile);
    }
}