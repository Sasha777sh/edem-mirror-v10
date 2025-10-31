#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking EDEM Mirror v10 deployment status...');

try {
    // Check Git status
    console.log('\n📁 Git Status:');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim() === '') {
        console.log('✅ No uncommitted changes');
    } else {
        console.log('⚠️  Uncommitted changes found:');
        console.log(gitStatus);
    }

    // Check if we're logged in to Vercel
    console.log('\n🔐 Vercel Login Status:');
    try {
        const whoami = execSync('vercel whoami', { encoding: 'utf8' });
        console.log(`✅ Logged in as: ${whoami.trim()}`);
    } catch (error) {
        console.log('❌ Not logged in to Vercel');
    }

    // Check remote repository
    console.log('\n📡 Remote Repository:');
    const remote = execSync('git remote -v', { encoding: 'utf8' });
    console.log(remote);

    // Check last commit
    console.log('\n📝 Last Commit:');
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' });
    console.log(lastCommit);

    console.log('\n✅ Deployment check completed!');
} catch (error) {
    console.error('❌ Error checking deployment status:', error.message);
    process.exit(1);
}