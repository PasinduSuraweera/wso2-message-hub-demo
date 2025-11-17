#!/usr/bin/env pwsh
# Simple WSO2 MI Startup Script

Write-Host "Starting WSO2 MI Setup..." -ForegroundColor Green

# Check if Java is available
try {
    java -version
    Write-Host "Java is available" -ForegroundColor Green
} catch {
    Write-Host "Java not found! Please install Java 8 or 11" -ForegroundColor Red
    exit 1
}

# Download and extract WSO2 MI if needed
$WSO2_DIR = "wso2mi"
if (-not (Test-Path "$WSO2_DIR\bin\micro-integrator.bat")) {
    Write-Host "Downloading WSO2 MI..." -ForegroundColor Yellow
    
    New-Item -ItemType Directory -Path $WSO2_DIR -Force | Out-Null
    
    $url = "https://github.com/wso2/micro-integrator/releases/download/v4.5.0/wso2mi-4.5.0.zip"
    $zipFile = "$WSO2_DIR\wso2mi.zip"
    
    Invoke-WebRequest -Uri $url -OutFile $zipFile
    Expand-Archive -Path $zipFile -DestinationPath $WSO2_DIR -Force
    
    # Move contents up
    Move-Item "$WSO2_DIR\wso2mi-4.5.0\*" $WSO2_DIR -Force
    Remove-Item "$WSO2_DIR\wso2mi-4.5.0" -Recurse
    Remove-Item $zipFile
}

# Copy CAR file if exists
$carFile = "target\messagehubintegrator_1.0.0.car"
if (Test-Path $carFile) {
    $carbonApps = "$WSO2_DIR\repository\deployment\server\carbonapps"
    New-Item -ItemType Directory -Path $carbonApps -Force | Out-Null
    Copy-Item $carFile $carbonApps -Force
    Write-Host "CAR file deployed" -ForegroundColor Green
}

Write-Host "Starting WSO2 MI on ports 8290 (runtime) and 9164 (management)..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red

# Start WSO2 MI
Set-Location "$WSO2_DIR\bin"
.\micro-integrator.bat