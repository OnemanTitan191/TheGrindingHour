# The Grinding Hour — Windows Startup Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "The Grinding Hour — Starting Up" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create and activate Python virtual environment
Write-Host "[1/5] Setting up Python environment..." -ForegroundColor Yellow
if (-not (Test-Path "backend\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Gray
    python -m venv backend\venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Gray
& "backend\venv\Scripts\Activate.ps1"

# Install backend dependencies
Write-Host "[2/5] Installing backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\requirements.txt") {
    pip install -r backend\requirements.txt | Out-Null
    Write-Host "Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Warning: backend\requirements.txt not found" -ForegroundColor Yellow
}

# Start backend server in background
Write-Host "[3/5] Starting backend server on port 8001..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "python" -ArgumentList "backend/main.py" -NoNewWindow -PassThru
Write-Host "Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
Start-Sleep -Seconds 2

# Install frontend dependencies
Write-Host "[4/5] Installing frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Push-Location frontend
    npm install | Out-Null
    Write-Host "Frontend dependencies installed" -ForegroundColor Green
    Pop-Location
} else {
    Write-Host "Warning: frontend\package.json not found" -ForegroundColor Yellow
}

# Start frontend dev server in background
Write-Host "[5/5] Starting frontend dev server on port 5174..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -NoNewWindow -PassThru
Write-Host "Frontend dev server started (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "The Grinding Hour is running!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:  http://localhost:8001" -ForegroundColor Magenta
Write-Host "Frontend:     http://localhost:5174" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the servers." -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Sleep -Seconds 3
Write-Host "Opening browser..." -ForegroundColor Gray
Start-Process "http://localhost:5174"

# Keep script running
Write-Host "Waiting for processes..." -ForegroundColor Gray
$backendProcess.WaitForExit()
$frontendProcess.WaitForExit()
