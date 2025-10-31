#!/usr/bin/env ts-node

/**
 * Script to verify that the landing page components are properly implemented
 */

import fs from 'fs';
import path from 'path';

// Check if DemoChatSection is imported and used in the landing page
const pagePath = path.join(__dirname, '../src/app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

if (pageContent.includes('DemoChatSection')) {
    console.log('✅ DemoChatSection is imported in the landing page');
} else {
    console.log('❌ DemoChatSection is not imported in the landing page');
}

// Check if TelegramLoginButton uses environment variable
const telegramButtonPath = path.join(__dirname, '../src/components/DemoChatSection.tsx');
const telegramButtonContent = fs.readFileSync(telegramButtonPath, 'utf8');

if (telegramButtonContent.includes('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME')) {
    console.log('✅ TelegramLoginButton uses environment variable for bot username');
} else {
    console.log('❌ TelegramLoginButton does not use environment variable for bot username');
}

// Check if environment variables are defined
const envExamplePath = path.join(__dirname, '../.env.example');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

if (envExampleContent.includes('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME')) {
    console.log('✅ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is defined in .env.example');
} else {
    console.log('❌ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not defined in .env.example');
}

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

if (envContent.includes('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME')) {
    console.log('✅ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is defined in .env');
} else {
    console.log('❌ NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is not defined in .env');
}

console.log('\nVerification complete!');