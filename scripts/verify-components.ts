#!/usr/bin/env ts-node

/**
 * Simple verification script for NSM components
 * This script checks if the necessary files exist and are properly structured
 */

import * as fs from 'fs';
import * as path from 'path';

function verifyComponents() {
    console.log('🔍 Verifying NSM Components...\n');

    // List of files to check
    const filesToCheck = [
        'src/app/api/session/feedback/route.ts',
        'src/app/api/analytics/nsm/route.ts',
        'src/components/SessionFeedback.tsx',
        'src/components/NsmDashboard.tsx',
        'src/lib/nsm.ts',
        'src/migrations/005_session_feedback.sql'
    ];

    let allExist = true;

    // Check if all files exist
    for (const file of filesToCheck) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${file} - EXISTS`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allExist = false;
        }
    }

    if (allExist) {
        console.log('\n🎉 All NSM components have been created successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Run the database migration to create the session_feedback table');
        console.log('   2. Test the session feedback API endpoint with a sample request');
        console.log('   3. Verify the MultiLevelChatV2 component shows feedback form after session completion');
        console.log('   4. Check the NSM dashboard component renders correctly');
        console.log('   5. Monitor analytics for NSM metrics');
    } else {
        console.log('\n⚠️  Some components are missing. Please check the implementation.');
    }
}

// Run the verification
verifyComponents();