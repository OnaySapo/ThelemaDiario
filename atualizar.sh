#!/usr/bin/env bash

# ==============================================================================
# Diário Mágicko Thelêmico — Atualizador Seguro para Linux & macOS
# Puxa atualizações do repositório sem tocar nas notas do usuário.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "========================================================"
echo " 🌟 DIÁRIO MÁGICKO THELÊMICO — ATUALIZADOR SEGURO"
echo "========================================================"
echo ""

# 1. Backup de segurança das notas locais
echo "[1/4] Protegendo suas anotações e criando backup local..."
mkdir -p "$DIR/data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ -f "$DIR/data/magick_diary.db" ]; then
    cp "$DIR/data/magick_diary.db" "$DIR/data/backups/backup_pre_update_${TIMESTAMP}.db"
    echo "      * Backup salvo em data/backups/backup_pre_update_${TIMESTAMP}.db"
else
    echo "      * Nenhum banco anterior detectado, iniciando novo."
fi

# 2. Puxar atualizações
echo ""
echo "[2/4] Puxando atualizações do GitHub (git pull origin main)..."
git pull origin main

# 3. Detectar Node / NPM
NODE_BIN="node"
NPM_BIN="npm"

if [ -d "$DIR/.node-linux/bin" ]; then
    export PATH="$DIR/.node-linux/bin:$PATH"
    NODE_BIN="$DIR/.node-linux/bin/node"
    NPM_BIN="$DIR/.node-linux/bin/npm"
fi

# 4. Atualizar dependências e compilar
echo ""
echo "[3/4] Instalando dependências atualizadas..."
"$NPM_BIN" install

echo ""
echo "[4/4] Compilando versão otimizada (npm run build)..."
"$NPM_BIN" run build

echo ""
echo "========================================================"
echo " ✓ ATUALIZAÇÃO CONCLUIDA COM SUCESSO!"
echo " Suas notas continuam 100% salvas e protegidas."
echo " Para iniciar o diário, execute: ./iniciar_diario.sh"
echo "========================================================"
