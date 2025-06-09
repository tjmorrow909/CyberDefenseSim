#!/usr/bin/env node

/**
 * Test build process to verify production build works correctly
 * This simulates the Render build environment
 */

import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        HUSKY: '0',
        CI: 'true',
        ...options.env
      },
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function cleanBuild() {
  console.log('🧹 Cleaning previous build...');
  
  const distPath = path.join(PROJECT_ROOT, 'dist');
  if (existsSync(distPath)) {
    rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Cleaned dist directory');
  }
}

async function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    await runCommand('npm', ['ci', '--include=dev']);
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    throw error;
  }
}

async function runBuild() {
  console.log('🏗️  Running production build...');
  
  try {
    await runCommand('npm', ['run', 'build:prod']);
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    throw error;
  }
}

async function verifyBuildOutput() {
  console.log('🔍 Verifying build output...');
  
  const requiredFiles = [
    'dist/index.js',
    'dist/public/index.html',
    'dist/public/assets'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    if (!existsSync(filePath)) {
      throw new Error(`Required build output missing: ${file}`);
    }
  }
  
  console.log('✅ All required build outputs present');
}

async function testStartup() {
  console.log('🚀 Testing application startup...');
  
  try {
    // Test that the built application can start (just check syntax)
    await runCommand('node', ['--check', 'dist/index.js']);
    console.log('✅ Application startup test passed');
  } catch (error) {
    console.error('❌ Application startup test failed:', error.message);
    throw error;
  }
}

async function runBuildTest() {
  console.log('🧪 CyberDefenseSim Build Test');
  console.log('='.repeat(50));
  console.log('This simulates the Render build process locally');
  console.log('');

  try {
    await cleanBuild();
    await installDependencies();
    await runBuild();
    await verifyBuildOutput();
    await testStartup();
    
    console.log('');
    console.log('='.repeat(50));
    console.log('🎉 Build test completed successfully!');
    console.log('✅ The application should deploy successfully on Render');
    console.log('');
    
    return true;
  } catch (error) {
    console.log('');
    console.log('='.repeat(50));
    console.log('❌ Build test failed!');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('Please fix the issues above before deploying to Render.');
    
    return false;
  }
}

// Run the test
runBuildTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
