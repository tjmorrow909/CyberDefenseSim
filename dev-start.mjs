#!/usr/bin/env node
import { spawn } from 'child_process';

// Use the correct import flag for Node.js v20+
const serverProcess = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

serverProcess.on('exit', (code) => {
  process.exit(code);
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
});