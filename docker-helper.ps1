# Dockerコンテナを起動するためのヘルパースクリプト
param(
    [switch]$Dev,
    [switch]$Build,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Restart
)

$composeFile = "docker-compose.yml"
if ($Dev) {
    $composeFile = "docker-compose.dev.yml"
}

if ($Build) {
    Write-Host "Building and starting container using $composeFile..." -ForegroundColor Green
    docker-compose -f $composeFile up -d --build
} elseif ($Stop) {
    Write-Host "Stopping containers using $composeFile..." -ForegroundColor Yellow
    docker-compose -f $composeFile down
} elseif ($Logs) {
    Write-Host "Showing logs using $composeFile..." -ForegroundColor Cyan
    docker-compose -f $composeFile logs -f
} elseif ($Restart) {
    Write-Host "Restarting containers using $composeFile..." -ForegroundColor Blue
    docker-compose -f $composeFile restart
} else {
    Write-Host "Starting containers using $composeFile..." -ForegroundColor Green
    docker-compose -f $composeFile up -d
}
