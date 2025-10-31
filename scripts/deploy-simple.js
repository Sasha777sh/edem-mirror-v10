#!/usr/bin/env node

// Simple deployment script for EDEM to Vercel
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting EDEM deployment to Vercel...');

try {
    // Check if Vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'pipe' });
        console.log('✅ Vercel CLI is installed');
    } catch (error) {
        console.log('📦 Installing Vercel CLI...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Deploy to production
    console.log('🌐 Deploying to Vercel production...');
    execSync('vercel --prod --yes', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
    });

    console.log('✅ Deployment completed successfully!');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}