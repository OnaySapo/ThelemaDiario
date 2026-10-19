@echo off
chcp 65001 >nul
title Diario Magicko Thelemico
color 07

cd /d "%~dp0"

set "NODE_DIR=%~dp0node-v24.21.0-win-x64"
set "PORTABLE_NODE_DIR=%~dp0.node-win\node-v22.14.0-win-x64"

if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
) else if exist "%PORTABLE_NODE_DIR%\node.exe" (
    set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
)

echo ==============================================================================
echo             DIARIO MAGICKO THELEMICO - LIBER SCIENTIA
echo            "O Metodo da Ciencia -- O Alvo da Religiao"
echo ==============================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js nao encontrado. Baixando motor Node.js portatil v22.14.0...
    if not exist ".node-win" mkdir ".node-win"
    powershell -NoProfile -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip' -OutFile '.node-win\node.zip'; Expand-Archive -Path '.node-win\node.zip' -DestinationPath '.node-win' -Force; Remove-Item '.node-win\node.zip' -Force"
    if exist "%PORTABLE_NODE_DIR%\node.exe" (
        set "PATH=%PORTABLE_NODE_DIR%;%PATH%"
        echo     * Motor Node.js portatil pronto!
    )
)

if not exist "node_modules" (
    echo [*] Primeira execucao detectada: instalando dependencias...
    call npm.cmd install
)

if not exist ".next\BUILD_ID" (
    echo [*] Compilando aplicacao para execucao rapida...
    call npm.cmd run build
)

echo [1/2] Abrindo navegador em http://localhost:3000 ...
echo [2/2] Servidor iniciado. Pressione Ctrl+C para encerrar o programa.
echo.

start "" "http://localhost:3000"

call npm.cmd run start

pause
