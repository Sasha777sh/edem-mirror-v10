#!/usr/bin/env node

// Script to deploy to Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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

    // Login to Vercel (will prompt for authentication if needed)
    console.log('🔐 Logging in to Vercel...');
    execSync('vercel login', { stdio: 'inherit' });

    // Deploy to production
    console.log('🌐 Deploying to Vercel production...');
    const deployOutput = execSync('vercel --prod --yes', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'pipe',
        encoding: 'utf-8'
    });

    console.log('✅ Deployment completed successfully!');
    console.log('🌍 Deployment URL:', deployOutput.match(/https:\/\/[^\s]+/)?.[0] || 'Check output above');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}

/**
 * Vercel Deployment Script for EDEM Living LLM
 * 
 * This script helps with the deployment process to Vercel by:
 * 1. Checking required environment variables
 * 2. Running build checks
 * 3. Providing deployment instructions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check if a command exists
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// Function to check environment variables
function checkEnvVars() {
    console.log('🔍 Checking environment variables...');

    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'OPENAI_API_KEY'
    ];

    const missingVars = [];

    for (const envVar of requiredVars) {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    }

    if (missingVars.length > 0) {
        console.log('❌ Missing required environment variables:');
        missingVars.forEach(envVar => console.log(`   - ${envVar}`));
        console.log('\n📝 Please set these variables in your Vercel project settings.');
        return false;
    }

    console.log('✅ All required environment variables are set.');
    return true;
}

// Function to run build check
function runBuildCheck() {
    console.log('\n🏗️  Running build check...');

    try {
        execSync('npm run build', { stdio: 'pipe' });
        console.log('✅ Build check passed.');
        return true;
    } catch (error) {
        console.log('❌ Build check failed:');
        console.log(error.message);
        return false;
    }
}

// Function to check dependencies
function checkDependencies() {
    console.log('\n📦 Checking dependencies...');

    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
        const dependencies = Object.keys(packageJson.dependencies || {});
        const devDependencies = Object.keys(packageJson.devDependencies || {});

        console.log(`✅ Found ${dependencies.length} dependencies and ${devDependencies.length} devDependencies.`);
        return true;
    } catch (error) {
        console.log('❌ Failed to read package.json:', error.message);
        return false;
    }
}

// Function to provide deployment instructions
function provideDeploymentInstructions() {
    console.log('\n🚀 Deployment Instructions:');
    console.log('1. Ensure all environment variables are set in Vercel dashboard');
    console.log('2. Connect your GitHub repository to Vercel');
    console.log('3. Set the build command to: npm run build');
    console.log('4. Set the output directory to: .next');
    console.log('5. Deploy!');
    console.log('\n📖 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md');
}

// Main function
async function main() {
    console.log('EDEM Living LLM - Vercel Deployment Helper');
    console.log('===========================================');

    // Check if we're in the correct directory
    if (!fs.existsSync(path.join(__dirname, '..', 'package.json'))) {
        console.log('❌ Please run this script from the project root directory.');
        process.exit(1);
    }

    // Check for required tools
    if (!commandExists('vercel')) {
        console.log('⚠️  Vercel CLI not found. Installing...');
        try {
            execSync('npm install -g vercel', { stdio: 'inherit' });
            console.log('✅ Vercel CLI installed.');
        } catch (error) {
            console.log('❌ Failed to install Vercel CLI:', error.message);
            console.log('📝 Please install manually: npm install -g vercel');
        }
    }

    // Run checks
    const envCheck = checkEnvVars();
    const depCheck = checkDependencies();
    const buildCheck = runBuildCheck();

    // Summary
    console.log('\n📋 Deployment Readiness Check:');
    console.log(`  Environment Variables: ${envCheck ? '✅' : '❌'}`);
    console.log(`  Dependencies: ${depCheck ? '✅' : '❌'}`);
    console.log(`  Build Check: ${buildCheck ? '✅' : '❌'}`);

    if (envCheck && depCheck) {
        console.log('\n🎉 Your project is ready for deployment!');
        provideDeploymentInstructions();
    } else {
        console.log('\n⚠️  Please fix the issues above before deploying.');
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkEnvVars, checkDependencies, runBuildCheck };