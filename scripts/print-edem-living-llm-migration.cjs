сти #!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.resolve(__dirname, '../src/migrations/007_edem_living_llm.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

console.log('=== EDEM Living LLM Migration SQL ===');
console.log('Copy and paste this into your Supabase SQL editor:\n');
console.log(migrationSql);
console.log('\n=== End of Migration SQL ===');