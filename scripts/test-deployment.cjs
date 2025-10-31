#!/usr/bin/env node

/**
 * Script to test deployment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('Testing deployment configuration...\n');

// Check if required files exist
const requiredFiles = [
    '.github/workflows/deploy.yml',
    'vercel.json',
    '.env.production',
    'DEPLOYMENT_GUIDE.md'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} is missing`);
        allFilesExist = false;
    }
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
    console.log('✅ All deployment files are properly configured!');
    console.log('\nNext steps:');
    console.log('1. Push to GitHub main branch');
    console.log('2. Connect repository to Vercel');
    console.log('3. Set environment variables in Vercel dashboard');
    console.log('4. Run database migrations');
    console.log('5. Import RAG data');
    console.log('6. Generate embeddings');
    console.log('\nDeployment ready! 🚀');
} else {
    console.log('❌ Some deployment files are missing. Please check the errors above.');
}

console.log('\n' + '='.repeat(50));