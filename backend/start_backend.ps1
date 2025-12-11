# Echo-Check Backend Startup Script
Write-Host "🛡️ Starting Echo-Check Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
try {
    python -c "import flask, pymongo, bcrypt, jwt" 2>&1 | Out-Null
    Write-Host "✓ All dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Dependencies missing! Installing..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item env.example.txt .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file and set a secure JWT_SECRET!" -ForegroundColor Yellow
}

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "*mongo*" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB service found but not running" -ForegroundColor Yellow
        Write-Host "   Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name $mongoService.Name -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "⚠️  MongoDB service not found. Make sure MongoDB is installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Flask backend server..." -ForegroundColor Cyan
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Flask app
python app.py








