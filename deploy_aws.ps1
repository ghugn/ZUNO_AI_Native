# Script to deploy ZUNO Wallet from local machine to AWS EC2 instance

$IP = "13.219.151.203"
$KEY = "zuno-key.pem"
$USER = "ubuntu"
$REMOTE_DIR = "zuno-wallet"
$ZIP_NAME = "project.zip"

Write-Host "1. Cleaning old build files..." -ForegroundColor Green
if (Test-Path $ZIP_NAME) { Remove-Item $ZIP_NAME -Force }

Write-Host "2. Creating project.zip using git archive (ignoring node_modules, .next, local .env)..." -ForegroundColor Green
# git archive creates a clean zip from the latest git commit / HEAD state
git archive --format=zip HEAD -o $ZIP_NAME

if (-not (Test-Path $ZIP_NAME)) {
    Write-Error "Failed to create project.zip using git archive."
    exit 1
}

Write-Host "3. Uploading project.zip to AWS server ($IP) via SCP..." -ForegroundColor Green
scp -i $KEY -o StrictHostKeyChecking=no $ZIP_NAME "$($USER)@$($IP):/home/$USER/$ZIP_NAME"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error uploading file via SCP."
    exit 1
}

Write-Host "4. Extracting and rebuilding containers on AWS server..." -ForegroundColor Green
$REMOTE_COMMANDS = @"
unzip -o /home/$USER/$ZIP_NAME -d /home/$USER/$REMOTE_DIR
cd /home/$USER/$REMOTE_DIR
docker compose down -v
docker compose up -d --build
"@

ssh -i $KEY -o StrictHostKeyChecking=no "$($USER)@$($IP)" $REMOTE_COMMANDS

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error running deployment commands on AWS."
    exit 1
}

# Clean up local zip
Remove-Item $ZIP_NAME -Force

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Cyan
