@echo off
chcp 65001 > nul
title Diário Mágicko Thelêmico
color 02

set "PATH=C:\Users\gyano\Downloads\node-v24.21.0-win-x64;%PATH%"

echo ==============================================================================
echo             DIÁRIO MÁGICKO THELÊMICO — LIBER SCIENTIA
echo         "O Método da Ciência -- O Alvo da Religião"
echo ==============================================================================
echo.
echo [1/2] Iniciando o servidor sagrado em http://localhost:3000 ...
echo [2/2] Pressione Ctrl+C para encerrar o programa a qualquer momento.
echo.

start "" "http://localhost:3000"

npm run start

pause
