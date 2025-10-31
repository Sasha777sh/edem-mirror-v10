#!/usr/bin/env ts-node

/**
 * Verify that the EDEM Living LLM system is ready for deployment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

async function verifyDeploymentReadiness() {
  console.log('🔍 Verifying EDEM Living LLM Deployment Readiness...\n');
  
  const checks = [
    {
      name: 'Project Structure',
      check: () => {
        const requiredFiles = [
          'package.json',
          'next.config.mjs',
          'tsconfig.json',
          'vercel.json',
          'README.md',
          'DEPLOYMENT_GUIDE.md'
        ];
        
        for (const file of requiredFiles) {
          if (!existsSync(join(process.cwd(), file))) {
            throw new Error(`Missing required file: ${file}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Database Migrations',
      check: () => {
        const migrations = [
          'src/migrations/001_init.sql',
          'src/migrations/003_dialogue_system.sql',
          'src/migrations/004_rag_system.sql',
          'src/migrations/006_onboarding_mirror.sql',
          'src/migrations/007_edem_living_llm.sql',
          'src/migrations/008_user_preferences.sql',
          'src/migrations/009_user_feedback.sql'
        ];
        
        for (const migration of migrations) {
          if (!existsSync(join(process.cwd(), migration))) {
            throw new Error(`Missing migration file: ${migration}`);
          }
        }
        return true;
      }
    },
    {
      name: 'API Endpoints',
      check: () => {
        const apiEndpoints = [
          'src/app/api/health/route.ts',
          'src/app/api/edem-living-llm/route.ts',
          'src/app/api/edem-living-llm/preferences/route.ts',
          'src/app/api/edem-living-llm/clear-history/route.ts',
          'src/app/api/edem-living-llm/feedback/route.ts'
        ];
        
        for (const endpoint of apiEndpoints) {
          if (!existsSync(join(process.cwd(), endpoint))) {
            throw new Error(`Missing API endpoint: ${endpoint}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Core Components',
      check: () => {
        const components = [
          'src/lib/edem-living-llm/core.ts',
          'src/lib/edem-living-llm/emotion-engine.ts',
          'src/lib/edem-living-llm/scene-engine.ts',
          'src/lib/edem-living-llm/ritual-engine.ts',
          'src/lib/edem-living-llm/voice-generator.ts',
          'src/lib/edem-living-llm/user-preferences.ts',
          'src/lib/edem/promptEngine.ts'
        ];
        
        for (const component of components) {
          if (!existsSync(join(process.cwd(), component))) {
            throw new Error(`Missing core component: ${component}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Documentation',
      check: () => {
        const docs = [
          'docs/edem-living-llm.md',
          'docs/prompt-engine.md',
          'docs/mental-profiling.md',
          'docs/user-privacy-and-extended-content.md',
          'DEPLOYMENT_GUIDE.md',
          'DEPLOYMENT_SUMMARY.md'
        ];
        
        for (const doc of docs) {
          if (!existsSync(join(process.cwd(), doc))) {
            throw new Error(`Missing documentation: ${doc}`);
          }
        }
        return true;
      }
    },
    {
      name: 'Scripts',
      check: () => {
        const scripts = [
          'scripts/deploy.sh',
          'scripts/migrate-all.ts'
        ];
        
        for (const script of scripts) {
          if (!existsSync(join(process.cwd(), script))) {
            throw new Error(`Missing script: ${script}`);
          }
        }
        return true;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, check } of checks) {
    try {
      check();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${(error as Error).message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Verification Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total: ${checks.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All checks passed! The system is ready for deployment.');
    console.log('\n🚀 To deploy, run:');
    console.log('   npm run deploy');
    return true;
  } else {
    console.log('\n⚠️ Some checks failed. Please fix the issues before deployment.');
    return false;
  }
}

// Run the verification
verifyDeploymentReadiness().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed with error:', error);
  process.exit(1);
});