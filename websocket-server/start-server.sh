#!/bin/bash
echo "Starting Wholumi WebSocket Server..."
cd "$(dirname "$0")"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
echo "Starting server..."
npm start
