import { loadEnvFile } from 'node:process';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get the current file's directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
if (existsSync(join(__dirname, '.env.local'))) {
  loadEnvFile(join(__dirname, '.env.local'));
}

if (existsSync(join(__dirname, '.env.development.local'))) {
  loadEnvFile(join(__dirname, '.env.development.local'));
}

if (existsSync(join(__dirname, '.env.production.local')) && process.env.NODE_ENV === 'production') {
  loadEnvFile(join(__dirname, '.env.production.local'));
}

// Get the npx command and arguments from command line
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide an npx command and its arguments');
  process.exit(1);
}

// Run the npx command
const npx = spawn('npx', args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

npx.on('close', (code) => {
  console.log(`npx command exited with code ${code}`);
});
