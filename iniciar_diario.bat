@echo off
title Diario Magicko Thelemico
color 07

cd /d "%~dp0"

set "NODE_DIR=%~dp0node-v24.21.0-win-x64"

if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
)

echo ==============================================================================
echo             DIARIO MAGICKO THELEMICO - LIBER SCIENTIA
echo            "O Metodo da Ciencia -- O Alvo da Religiao"
echo ==============================================================================
echo.
echo [1/2] Abrindo navegador em http://localhost:3000 ...
echo [2/2] Servidor iniciado. Pressione Ctrl+C para encerrar o programa.
echo.

start "" "http://localhost:3000"

call npm.cmd run start

pause
