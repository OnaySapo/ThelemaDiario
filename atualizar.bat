@echo off
chcp 65001 >nul
echo ========================================================
echo   DIARIO MAGICKO THELEMICO - ATUALIZADOR SEGURO
echo ========================================================
echo.
echo [1/4] Protegendo suas anotacoes e criando backup local...

if not exist "data\backups" mkdir "data\backups"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

if exist "data\magick_diary.db" (
    copy /y "data\magick_diary.db" "data\backups\backup_pre_update_%TIMESTAMP%.db" >nul
    echo       * Backup salvo com sucesso em data\backups\backup_pre_update_%TIMESTAMP%.db
) else (
    echo       * Nenhum banco anterior detectado, iniciando novo.
)

echo.
echo [2/4] Puxando atualizacoes do GitHub (git pull origin main)...
git pull origin main

echo.
echo [3/4] Instalando dependencias atualizadas...
call npm install

echo.
echo [4/4] Compilando versao otimizada (npm run build)...
call npm run build

echo.
echo ========================================================
echo   ATUALIZACAO CONCLUIDA COM SUCESSO!
echo   Suas notas continuam 100%% salvas e protegidas.
echo   Para iniciar, execute: npm start
echo ========================================================
pause
