# Dockerコンテナを起動するためのヘルパースクリプト
param(
    [switch]$Dev,
    [switch]$Build,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Restart,
    [switch]$Volumes,
    [switch]$Config
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
} elseif ($Volumes) {
    Write-Host "Listing Docker volumes for this project..." -ForegroundColor Magenta
    docker volume ls --filter "name=discordbot_"
} elseif ($Config) {
    Write-Host "Checking configuration volume..." -ForegroundColor Cyan
    
    # コンフィグボリュームのマウントパスを確認
    $configPath = docker volume inspect discordbot_config-volume --format "{{.Mountpoint}}"
    Write-Host "Config volume path: $configPath" -ForegroundColor Yellow
    
    # 一時的なコンテナを起動してボリューム内のファイルを確認
    Write-Host "Files in config volume:" -ForegroundColor Green
    docker run --rm -v discordbot_config-volume:/data alpine ls -la /data
} else {
    Write-Host "Starting containers using $composeFile..." -ForegroundColor Green
    docker-compose -f $composeFile up -d
}
