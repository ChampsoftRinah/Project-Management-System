#!/usr/bin/env pwsh
# Quick setup script for local development (Windows PowerShell)

Write-Host "🚀 PM System - Local Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "✓ Checking Node.js..." -ForegroundColor Green
$nodeVersion = node --version
Write-Host "  Node.js $nodeVersion`n"

# Check PostgreSQL
Write-Host "✓ Checking PostgreSQL..." -ForegroundColor Green
try {
  $psqlVersion = psql --version
  Write-Host "  $psqlVersion`n"
} catch {
  Write-Host "  ⚠️  PostgreSQL client not found. Ensure PostgreSQL is installed and in PATH." -ForegroundColor Yellow
}

# Ensure .env exists
if (-not (Test-Path ".env")) {
  Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
  Copy-Item ".env.example" ".env"
  Write-Host "✓ .env created. Update DB credentials if needed.`n" -ForegroundColor Green
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Green
Push-Location backend
npm install
Pop-Location
Write-Host "✓ Backend dependencies installed`n"

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Green
Push-Location frontend
npm install
Pop-Location
Write-Host "✓ Frontend dependencies installed`n"

# Initialize database
Write-Host "🔧 Initializing database schema..." -ForegroundColor Green
Push-Location backend
npm run init-db
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Database initialization failed. Check PostgreSQL connection." -ForegroundColor Red
  Pop-Location
  exit 1
}
Pop-Location
Write-Host "✓ Database schema created`n"

# Seed test data
Write-Host "🌱 Seeding test data..." -ForegroundColor Green
Push-Location backend
npm run seed
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Seeding failed." -ForegroundColor Red
  Pop-Location
  exit 1
}
Pop-Location
Write-Host "✓ Test data seeded`n"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup complete!" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open browser:       http://localhost:3001" -ForegroundColor White
Write-Host "`nTest credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@test.com" -ForegroundColor Cyan
Write-Host "  Password: 123456" -ForegroundColor Cyan
Write-Host "  Tenant:   tenant-001" -ForegroundColor Cyan
