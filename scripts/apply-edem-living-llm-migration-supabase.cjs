#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Get Supabase connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL or Service Key not found in environment variables');
    process.exit(1);
}

// Create Supabase client with service role key (full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the migration file
const migrationPath = path.resolve(__dirname, '../src/migrations/007_edem_living_llm.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Split the migration into individual statements
// This is a simple split by semicolon, which should work for our migration
const statements = migrationSql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

async function applyMigration() {
    console.log('Applying EDEM Living LLM migration to Supabase...');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        try {
            // For CREATE TABLE and other DDL statements, we need to use raw SQL
            const { error } = await supabase.rpc('execute_sql', { sql: statement });

            // If rpc doesn't work, we'll try a different approach
            if (error) {
                console.log(`Statement failed with RPC, trying direct approach: ${error.message}`);
                // We'll need to handle this differently since Supabase JS client doesn't support raw DDL
                console.log('Skipping statement execution in JS client - will need to run manually in Supabase SQL editor');
            }
        } catch (err) {
            console.log(`Error executing statement: ${err.message}`);
        }
    }

    console.log('EDEM Living LLM migration processing completed!');
    console.log('Note: Some statements may need to be run manually in the Supabase SQL editor');
}

applyMigration().catch(console.error);