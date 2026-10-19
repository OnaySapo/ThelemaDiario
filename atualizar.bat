@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo   DIARIO MAGICKO THELEMICO - ATUALIZADOR SEGURO
echo ========================================================
echo.

set "NODE_DIR=%~dp0node-v24.21.0-win-x64"
set "PORTABLE_NODE_DIR=%~dp0.node-win\node-v22.14.0-win-x64"

if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
) else if exist "%PORTABLE_NODE_DIR%\node.exe" (
    set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js nao encontrado. Baixando motor Node.js portatil v22.14.0...
    if not exist ".node-win" mkdir ".node-win"
    powershell -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip' -OutFile '.node-win\node.zip'; Expand-Archive -Path '.node-win\node.zip' -DestinationPath '.node-win' -Force; Remove-Item '.node-win\node.zip' -Force"
    if exist "%PORTABLE_NODE_DIR%\node.exe" (
        set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
        echo     * Motor Node.js portatil instalado com sucesso!
    )
)

echo [1/4] Protegendo suas anotacoes e criando backup local...

if not exist "data\backups" mkdir "data\backups"

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd_HHmmss'"') do set TIMESTAMP=%%I

if exist "data\magick_diary.db" (
    copy /y "data\magick_diary.db" "data\backups\backup_pre_update_%TIMESTAMP%.db" >nul
    echo       * Backup salvo com sucesso em data\backups\backup_pre_update_%TIMESTAMP%.db
) else (
    echo       * Nenhum banco anterior detectado, iniciando novo.
)

echo.
echo [2/4] Puxando atualizacoes do GitHub (git pull origin main)...
git checkout -- package-lock.json 2>nul
git fetch origin main
git pull --no-rebase origin main

echo.
echo [3/4] Instalando dependencias atualizadas...
call npm.cmd install

echo.
echo [4/4] Compilando versao otimizada (npm run build)...
if exist ".next" rmdir /s /q ".next"
call npm.cmd run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha durante a compilacao. Verifique as mensagens acima.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo   Suas notas continuam 100%% salvas e protegidas.
echo   Para iniciar, execute: iniciar_diario.bat
echo ========================================================
pause
