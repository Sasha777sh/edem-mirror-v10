#!/usr/bin/env ts-node

/**
 * Script to apply the NSM migration to the database
 * This script creates the session_feedback table and indexes
 */

// Use CommonJS require since we're running as a script
const { sql } = require('../src/lib/db');

async function applyNsmMigration() {
    console.log('🚀 Applying NSM Migration...\n');

    try {
        // Create the session_feedback table
        await sql`
      create table if not exists session_feedback (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references users(id) on delete cascade,
        session_id uuid references sessions(id) on delete cascade,
        feedback boolean not null,
        comment text,
        shift_score int check (shift_score between 0 and 10),
        created_at timestamptz default now()
      )
    `;

        // Create indexes
        await sql`create index if not exists idx_session_feedback_user_id on session_feedback(user_id)`;
        await sql`create index if not exists idx_session_feedback_session_id on session_feedback(session_id)`;
        await sql`create index if not exists idx_session_feedback_created_at on session_feedback(created_at)`;

        console.log('✅ NSM migration applied successfully!');
        console.log('\n📋 The session_feedback table has been created with:');
        console.log('   - id: UUID primary key');
        console.log('   - user_id: Foreign key to users table');
        console.log('   - session_id: Foreign key to sessions table');
        console.log('   - feedback: Boolean (true = "стало легче", false = "не помогло")');
        console.log('   - comment: Optional text comment');
        console.log('   - shift_score: Integer between 0-10');
        console.log('   - created_at: Timestamp with default now()');
        console.log('\n📊 Indexes created for better query performance');

    } catch (error) {
        console.error('❌ Error applying NSM migration:', error);
        process.exit(1);
    }
}

// Run the migration
applyNsmMigration();