# Dockerコンテナを起動するためのヘルパースクリプト
param(
    [switch]$Dev,
    [switch]$Build,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Restart,
    [switch]$Volumes,
    [switch]$Config,
    [switch]$LogVolume,
    [switch]$Prune,
    [switch]$Health
)

# 環境に応じたファイル名とボリューム名を設定
$composeFile = "docker-compose.yml"
$configVolume = "trello-discord-config"
$logsVolume = "trello-discord-logs"
$containerName = "trello-discord-bot"

if ($Dev) {
    $composeFile = "docker-compose.dev.yml"
    $configVolume = "trello-discord-config-dev"
    $logsVolume = "trello-discord-logs-dev"
    $containerName = "trello-discord-bot-dev"
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
    docker volume ls --filter "name=trello-discord"
} elseif ($Config) {
    Write-Host "Checking configuration volume..." -ForegroundColor Cyan
    
    # コンフィグボリュームのマウントパスを確認
    $configPath = docker volume inspect $configVolume --format "{{.Mountpoint}}"
    Write-Host "Config volume path: $configPath" -ForegroundColor Yellow
    
    # 一時的なコンテナを起動してボリューム内のファイルを確認
    Write-Host "Files in config volume:" -ForegroundColor Green
    docker run --rm -v ${configVolume}:/data alpine ls -la /data
} elseif ($LogVolume) {
    Write-Host "Checking logs volume..." -ForegroundColor Cyan
    
    # ログボリュームの内容を確認
    Write-Host "Files in logs volume:" -ForegroundColor Green
    docker run --rm -v ${logsVolume}:/data alpine ls -la /data
} elseif ($Prune) {
    Write-Host "Pruning unused Docker resources..." -ForegroundColor Red
    docker system prune -f
    Write-Host "Pruning completed." -ForegroundColor Green
} elseif ($Health) {
    Write-Host "Checking container health..." -ForegroundColor Cyan
    docker inspect --format="{{.State.Health.Status}}" $containerName
} else {
    Write-Host "Starting containers using $composeFile..." -ForegroundColor Green
    docker-compose -f $composeFile up -d
}
