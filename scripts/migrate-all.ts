#!/usr/bin/env ts-node

/**
 * Run all database migrations in order
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

async function runAllMigrations() {
  console.log('🚀 Running all database migrations...');
  
  const migrations = [
    'src/migrations/001_init.sql',
    'src/migrations/003_dialogue_system.sql',
    'src/migrations/004_rag_system.sql',
    'src/migrations/006_onboarding_mirror.sql',
    'src/migrations/007_edem_living_llm.sql',
    'src/migrations/008_user_preferences.sql',
    'src/migrations/009_user_feedback.sql'
  ];
  
  const setupScripts = [
    'scripts/setup-rag-embeddings.sql'
  ];
  
  try {
    // Run main migrations
    for (const migration of migrations) {
      console.log(`\n📋 Running migration: ${migration}`);
      execSync(`psql $DATABASE_URL -f ${migration}`, { stdio: 'inherit' });
      console.log(`✅ Completed migration: ${migration}`);
    }
    
    // Run setup scripts
    for (const script of setupScripts) {
      console.log(`\n🔧 Running setup script: ${script}`);
      execSync(`psql $DATABASE_URL -f ${script}`, { stdio: 'inherit' });
      console.log(`✅ Completed setup script: ${script}`);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
    // Run data import scripts
    console.log('\n📦 Importing initial data...');
    execSync('npm run import-rag-data', { stdio: 'inherit' });
    console.log('✅ Initial data import completed!');
    
    // Generate embeddings
    console.log('\n🧠 Generating embeddings...');
    execSync('npm run generate-embeddings', { stdio: 'inherit' });
    console.log('✅ Embeddings generation completed!');
    
    console.log('\n🎊 Database setup is complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runAllMigrations();