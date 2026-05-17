#!/bin/bash

# The Grinding Hour — Unix/macOS Startup Script

echo "==========================================="
echo "The Grinding Hour — Starting Up"
echo "==========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create and activate Python virtual environment
echo "[1/5] Setting up Python environment..."
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv backend/venv
fi

echo "Activating virtual environment..."
source backend/venv/bin/activate

# Install backend dependencies
echo "[2/5] Installing backend dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt > /dev/null 2>&1
    echo "Backend dependencies installed"
else
    echo "Warning: backend/requirements.txt not found"
fi

# Start backend server in background
echo "[3/5] Starting backend server on port 8001..."
python backend/main.py &
BACKEND_PID=$!
echo "Backend server started (PID: $BACKEND_PID)"
sleep 2

# Install frontend dependencies
echo "[4/5] Installing frontend dependencies..."
if [ -f "frontend/package.json" ]; then
    (cd frontend && npm install > /dev/null 2>&1)
    echo "Frontend dependencies installed"
else
    echo "Warning: frontend/package.json not found"
fi

# Start frontend dev server in background
echo "[5/5] Starting frontend dev server on port 5174..."
(cd frontend && npm run dev > /dev/null 2>&1) &
FRONTEND_PID=$!
echo "Frontend dev server started (PID: $FRONTEND_PID)"

echo ""
echo "==========================================="
echo "The Grinding Hour is running!"
echo "==========================================="
echo ""
echo "Backend API:  http://localhost:8001"
echo "Frontend:     http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop the servers."
echo ""

# Open browser
sleep 3
echo "Opening browser..."
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:5174" &
elif command -v open > /dev/null; then
    open "http://localhost:5174" &
else
    echo "Could not auto-open browser. Visit http://localhost:5174 manually."
fi

echo "Waiting for processes..."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
