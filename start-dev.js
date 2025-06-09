const { spawn } = require('child_process');
const path = require('path');

// Start the server with the correct Node.js import syntax for v20+
const serverProcess = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  cwd: __dirname,
});

// Handle process termination
process.on('SIGTERM', () => serverProcess.kill('SIGTERM'));
process.on('SIGINT', () => serverProcess.kill('SIGINT'));
process.on('exit', () => serverProcess.kill());

serverProcess.on('exit', code => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

serverProcess.on('error', error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
