#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  DIARIO MAGICKO THELEMICO - ATUALIZADOR SEGURO"
echo "========================================================"
echo ""
echo "[1/4] Protegendo suas anotacoes e criando backup local..."

mkdir -p "data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ -f "data/magick_diary.db" ]; then
    cp "data/magick_diary.db" "data/backups/backup_pre_update_${TIMESTAMP}.db"
    echo "      * Backup salvo com sucesso em data/backups/backup_pre_update_${TIMESTAMP}.db"
else
    echo "      * Nenhum banco anterior detectado."
fi

echo ""
echo "[2/4] Puxando atualizacoes do GitHub (git pull origin main)..."
git pull origin main

echo ""
echo "[3/4] Instalando dependencias atualizadas..."
npm install

echo ""
echo "[4/4] Compilando versao otimizada (npm run build)..."
npm run build

echo ""
echo "========================================================"
echo "  ATUALIZACAO CONCLUIDA COM SUCESSO!"
echo "  Suas notas continuam 100% salvas e protegidas."
echo "  Para iniciar, execute: npm start"
echo "========================================================"
