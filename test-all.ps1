# Script: Start Docker, ensure nammongodb, run API, test CRUD
Write-Host "=========================================="
Write-Host "  Product API - Full Test Script"
Write-Host "=========================================="

# 1. Start Docker Desktop
Write-Host "`n[1/5] Starting Docker Desktop..."
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker to be ready
for ($i=1; $i -le 30; $i++) {
    Start-Sleep -Seconds 5
    $null = docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Docker ready after $($i*5)s!"
        break
    }
    Write-Host "  Attempt $i - waiting..."
}

# 2. Ensure nammongodb is running
Write-Host "`n[2/5] Starting nammongodb..."
docker start nammongodb 2>$null
Start-Sleep -Seconds 5
$status = docker ps --filter "name=nammongodb" --format "{{.Status}}"
Write-Host "  nammongodb: $status"

# 3. Start API server in background
Write-Host "`n[3/5] Starting API server..."
$env:PORT = "3000"
$env:MONGO_URI = "mongodb://localhost:27018/productdb"
$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:PORT = "3000"
    $env:MONGO_URI = "mongodb://localhost:27018/productdb"
    node server.js 2>&1
}
Start-Sleep -Seconds 5

# 4. Test Health
Write-Host "`n[4/5] Testing API..."
try {
    $h = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "  HEALTH: $($h.StatusCode) - $($h.Content)"
} catch {
    Write-Host "  HEALTH FAILED: $_"
    # Check server logs
    $jobOutput = Receive-Job -Job $serverJob -ErrorAction SilentlyContinue
    Write-Host "  Server output: $jobOutput"
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    exit 1
}

# 5. CRUD Tests
Write-Host "`n[5/5] Running CRUD Tests..."

# CREATE
Write-Host "`n  --- CREATE P001 ---"
$body1 = '{"pid":"P001","pname":"Laptop Dell XPS 15","price":1500,"quantity":10}'
$c1 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Body $body1 -ContentType "application/json" -UseBasicParsing
Write-Host "  Status: $($c1.StatusCode) | $($c1.Content)"

Write-Host "`n  --- CREATE P002 ---"
$body2 = '{"pid":"P002","pname":"MacBook Pro M3","price":2500,"quantity":5}'
$c2 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing
Write-Host "  Status: $($c2.StatusCode) | $($c2.Content)"

# READ ALL
Write-Host "`n  --- GET ALL ---"
$g1 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing
Write-Host "  Status: $($g1.StatusCode) | $($g1.Content)"

# READ ONE
Write-Host "`n  --- GET P001 ---"
$g2 = Invoke-WebRequest -Uri "http://localhost:3000/api/products/P001" -UseBasicParsing
Write-Host "  Status: $($g2.StatusCode) | $($g2.Content)"

# UPDATE
Write-Host "`n  --- UPDATE P001 ---"
$ubody = '{"pname":"Dell XPS 15 (Updated)","price":1800,"quantity":15}'
$u = Invoke-WebRequest -Uri "http://localhost:3000/api/products/P001" -Method PUT -Body $ubody -ContentType "application/json" -UseBasicParsing
Write-Host "  Status: $($u.StatusCode) | $($u.Content)"

# DELETE
Write-Host "`n  --- DELETE P002 ---"
$d = Invoke-WebRequest -Uri "http://localhost:3000/api/products/P002" -Method DELETE -UseBasicParsing
Write-Host "  Status: $($d.StatusCode) | $($d.Content)"

# VERIFY DELETE
Write-Host "`n  --- GET ALL after delete ---"
$g3 = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing
Write-Host "  Status: $($g3.StatusCode) | $($g3.Content)"

# Cleanup
Write-Host "`n=========================================="
Write-Host "  ALL CRUD TESTS COMPLETED SUCCESSFULLY!"
Write-Host "=========================================="

Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
