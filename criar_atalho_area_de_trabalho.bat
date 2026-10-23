@echo off
chcp 65001 >nul
title Criador de Atalho - Diário Mágicko Thelêmico
color 0b

cd /d "%~dp0"

echo ==============================================================================
echo       CRIAR ATALHO NA ÁREA DE TRABALHO - DIÁRIO MÁGICKO THELÊMICO
echo ==============================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "TARGET=%SCRIPT_DIR%iniciar_sem_console.vbs"
set "ICON=%SCRIPT_DIR%public\favicon.ico"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
    "$shortcut = $wsh.CreateShortcut(\"$desktop\Diário Mágicko Thelêmico.lnk\"); " ^
    "$shortcut.TargetPath = 'wscript.exe'; " ^
    "$shortcut.Arguments = '\"%TARGET%\"'; " ^
    "$shortcut.WorkingDirectory = '%SCRIPT_DIR%'; " ^
    "if (Test-Path '%ICON%') { $shortcut.IconLocation = '%ICON%'; } else { $shortcut.IconLocation = 'shell32.dll,43'; } " ^
    "$shortcut.Description = 'Diário Mágicko Thelêmico - Liber Scientia'; " ^
    "$shortcut.Save()"

if %errorlevel% equ 0 (
    echo [✓] Atalho criado com sucesso na sua Área de Trabalho!
    echo     Basta dar um duplo clique nele para abrir o Diário sem janela de terminal.
) else (
    echo [X] Erro ao criar atalho na Área de Trabalho.
)

echo.
pause
