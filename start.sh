#!/bin/bash

echo "🚀 Starting Inventoriaus Valdymo Sistema..."
echo ""

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Check if database exists, if not seed it
if [ ! -f "server/database.sqlite" ]; then
    echo "🌱 Seeding database with demo data..."
    cd server && node seed-db.js && cd ..
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "📍 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "⚠️  Press Ctrl+C to stop both servers"
echo ""

# Start both servers in parallel
cd server && npm run dev &
SERVER_PID=$!

cd client && npm run dev &
CLIENT_PID=$!

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
