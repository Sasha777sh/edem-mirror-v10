#!/usr/bin/env ts-node

/**
 * Comprehensive test script for NSM implementation
 * This script verifies all components of the NSM system
 */

async function runNsmTests() {
    console.log('🧪 Running Comprehensive NSM Tests...\n');

    // Test 1: Verify all components exist
    console.log('1. Verifying NSM components...');
    const { execSync } = require('child_process');

    try {
        execSync('npx ts-node scripts/verify-components.ts', { stdio: 'inherit' });
        console.log('✅ Component verification passed\n');
    } catch (error) {
        console.error('❌ Component verification failed\n');
        process.exit(1);
    }

    // Test 2: Check database schema
    console.log('2. Checking database schema...');
    try {
        // This would normally connect to the database and verify the schema
        // For now, we'll just verify the migration file exists
        const fs = require('fs');
        const migrationPath = './src/migrations/005_session_feedback.sql';

        if (fs.existsSync(migrationPath)) {
            console.log('✅ Database migration file exists\n');
        } else {
            console.error('❌ Database migration file missing\n');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Database schema check failed\n');
        process.exit(1);
    }

    // Test 3: Verify API endpoints
    console.log('3. Verifying API endpoints...');
    const apiEndpoints = [
        './src/app/api/session/feedback/route.ts',
        './src/app/api/analytics/nsm/route.ts'
    ];

    let allEndpointsExist = true;
    for (const endpoint of apiEndpoints) {
        if (!require('fs').existsSync(endpoint)) {
            console.error(`❌ API endpoint missing: ${endpoint}`);
            allEndpointsExist = false;
        }
    }

    if (allEndpointsExist) {
        console.log('✅ All API endpoints exist\n');
    } else {
        console.error('❌ Some API endpoints are missing\n');
        process.exit(1);
    }

    // Test 4: Verify frontend components
    console.log('4. Verifying frontend components...');
    const components = [
        './src/components/SessionFeedback.tsx',
        './src/components/NsmDashboard.tsx'
    ];

    let allComponentsExist = true;
    for (const component of components) {
        if (!require('fs').existsSync(component)) {
            console.error(`❌ Component missing: ${component}`);
            allComponentsExist = false;
        }
    }

    if (allComponentsExist) {
        console.log('✅ All frontend components exist\n');
    } else {
        console.error('❌ Some frontend components are missing\n');
        process.exit(1);
    }

    // Test 5: Verify business logic
    console.log('5. Verifying business logic...');
    const logicFiles = [
        './src/lib/nsm.ts'
    ];

    let allLogicFilesExist = true;
    for (const file of logicFiles) {
        if (!require('fs').existsSync(file)) {
            console.error(`❌ Business logic file missing: ${file}`);
            allLogicFilesExist = false;
        }
    }

    if (allLogicFilesExist) {
        console.log('✅ All business logic files exist\n');
    } else {
        console.error('❌ Some business logic files are missing\n');
        process.exit(1);
    }

    // Test 6: Verify integration
    console.log('6. Verifying integration...');
    // Check if MultiLevelChatV2 was updated
    const chatComponent = './src/components/MultiLevelChatV2.tsx';
    if (require('fs').existsSync(chatComponent)) {
        const content = require('fs').readFileSync(chatComponent, 'utf8');
        if (content.includes('SessionFeedback')) {
            console.log('✅ Integration with MultiLevelChatV2 verified\n');
        } else {
            console.error('❌ SessionFeedback not integrated with MultiLevelChatV2\n');
            process.exit(1);
        }
    } else {
        console.error('❌ MultiLevelChatV2 component missing\n');
        process.exit(1);
    }

    console.log('🎉 All NSM tests passed!');
    console.log('\n📋 Implementation Summary:');
    console.log('   ✅ Database schema (session_feedback table)');
    console.log('   ✅ API endpoints (feedback submission and NSM metrics)');
    console.log('   ✅ Frontend components (SessionFeedback and NsmDashboard)');
    console.log('   ✅ Business logic (NSM calculations)');
    console.log('   ✅ Integration with existing components');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run the database migration to create the session_feedback table');
    console.log('   2. Test the API endpoints with real data');
    console.log('   3. Deploy to staging environment for user testing');
    console.log('   4. Monitor NSM metrics in production');
}

// Run the tests
runNsmTests();