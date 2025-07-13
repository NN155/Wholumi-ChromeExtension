#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Wholumi WebSocket Server...');

// Navigate to the correct directory
process.chdir(__dirname);

// Install dependencies if needed
const fs = require('fs');
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    const npm = spawn('npm', ['install'], { stdio: 'inherit' });
    npm.on('close', (code) => {
        if (code === 0) {
            startServer();
        } else {
            console.error('❌ Failed to install dependencies');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🌐 Starting server...');
    const server = spawn('node', ['server.js'], { stdio: 'inherit' });
    
    server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Gracefully shutting down...');
        server.kill('SIGTERM');
        process.exit(0);
    });
}
