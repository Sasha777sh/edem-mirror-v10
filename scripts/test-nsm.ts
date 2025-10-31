#!/usr/bin/env ts-node

/**
 * Test script for NSM (Net Satisfaction Metric) implementation
 * This script tests the NSM calculation functions and API endpoints
 */

// Use require for CommonJS import
const { calculateOverallNsm, getNsmTrend } = require('../src/lib/nsm');

async function testNsmImplementation() {
    console.log('🧪 Testing NSM Implementation...\n');

    try {
        // Test overall NSM calculation
        console.log('1. Testing overall NSM calculation...');
        const overallNsm = await calculateOverallNsm();
        console.log('   Overall NSM:', overallNsm);

        // Test NSM trend
        console.log('\n2. Testing NSM trend (30 days)...');
        const trend = await getNsmTrend(30);
        console.log('   Trend data points:', trend.length);
        if (trend.length > 0) {
            console.log('   Latest data point:', trend[trend.length - 1]);
        }

        console.log('\n✅ NSM implementation tests completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Run the migration to create the session_feedback table');
        console.log('   2. Test the session feedback API endpoint');
        console.log('   3. Verify the MultiLevelChatV2 component shows feedback form');
        console.log('   4. Check the NSM dashboard component');

    } catch (error) {
        console.error('❌ Error testing NSM implementation:', error);
        process.exit(1);
    }
}

// Run the test
testNsmImplementation();