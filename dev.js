import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Phoenix Intranet Development Environment...');

// Start Express Backend on Port 3002
console.log('📡 Starting Express Backend server (port 3002)...');
const backend = spawn('node', [join(__dirname, 'server.js')], {
    stdio: 'inherit',
    shell: true
});

// Start Vite Frontend
console.log('🎨 Starting Vite Frontend client...');
const frontend = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true
});

// Forward termination signals to child processes
const cleanup = () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
