#!/usr/bin/env bash

# ==============================================================================
# Diário Mágicko Thelêmico — Atualizador Seguro & Autônomo para Linux & macOS
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
echo "[1/5] Protegendo suas anotações e criando backup local..."
mkdir -p "$DIR/data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ -f "$DIR/data/magick_diary.db" ]; then
    cp "$DIR/data/magick_diary.db" "$DIR/data/backups/backup_pre_update_${TIMESTAMP}.db"
    echo "      ✓ Backup salvo em data/backups/backup_pre_update_${TIMESTAMP}.db"
else
    echo "      * Nenhum banco anterior detectado, iniciando novo."
fi

# 2. Puxar atualizações do GitHub sem conflito
echo ""
echo "[2/5] Puxando atualizações do GitHub (git pull origin main)..."

# Limpa possíveis alterações locais em arquivos rastreados (como package-lock.json) para não travar o pull
git checkout -- package-lock.json 2>/dev/null || true
git fetch origin main

# Sincroniza com a branch principal
git pull origin main || {
    echo "⚠️  Aviso: 'git pull' direto encontrou conflitos em arquivos de sistema."
    echo "    Sincronizando arquivos de código com origin/main (suas notas em data/ permanecem intocadas)..."
    git reset --hard origin/main
}

# 3. Garantir Node.js v22+ (necessário para node:sqlite nativo)
echo ""
echo "[3/5] Verificando ambiente de execução (Node.js >= 22.5.0)..."

NODE_BIN=""
NPM_BIN=""

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    NODE_MAJOR=$(node -v | tr -d 'v' | cut -d'.' -f1)
    NODE_MINOR=$(node -v | tr -d 'v' | cut -d'.' -f2)
    if [ "$NODE_MAJOR" -gt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -ge 5 ]; }; then
        echo "      ✓ Node.js detectado no sistema: $(node -v)"
        NODE_BIN="node"
        NPM_BIN="npm"
    fi
fi

if [ -z "$NODE_BIN" ]; then
    PORTABLE_DIR="$DIR/.node-linux"
    
    if [ -x "$PORTABLE_DIR/bin/node" ] && [ -x "$PORTABLE_DIR/bin/npm" ]; then
        echo "      ✓ Usando Node.js portátil local em $PORTABLE_DIR ($("$PORTABLE_DIR/bin/node" -v))"
    else
        echo "      ➜ Baixando versão portátil oficial do Node.js v22 (independente e autônomo)..."
        OS_NAME=$(uname -s | tr '[:upper:]' '[:lower:]')
        ARCH=$(uname -m)
        NODE_VER="v22.14.0"
        
        if [ "$OS_NAME" = "linux" ]; then
            if [ "$ARCH" = "x86_64" ]; then
                TAR_NAME="node-${NODE_VER}-linux-x64.tar.xz"
            elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
                TAR_NAME="node-${NODE_VER}-linux-arm64.tar.xz"
            else
                echo "❌ Arquitetura '$ARCH' não suportada automaticamente."
                exit 1
            fi
        elif [ "$OS_NAME" = "darwin" ]; then
            if [ "$ARCH" = "arm64" ]; then
                TAR_NAME="node-${NODE_VER}-darwin-arm64.tar.gz"
            else
                TAR_NAME="node-${NODE_VER}-darwin-x64.tar.gz"
            fi
        else
            echo "❌ Sistema '$OS_NAME' não suportado automaticamente pelo script."
            exit 1
        fi
        
        DOWNLOAD_URL="https://nodejs.org/dist/${NODE_VER}/${TAR_NAME}"
        TEMP_TAR="/tmp/${TAR_NAME}"
        
        echo "      ➜ Download de: $DOWNLOAD_URL"
        if command -v curl >/dev/null 2>&1; then
            curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_TAR"
        elif command -v wget >/dev/null 2>&1; then
            wget -q "$DOWNLOAD_URL" -O "$TEMP_TAR"
        else
            echo "❌ curl ou wget não encontrados. Instale curl no sistema."
            exit 1
        fi
        
        echo "      ➜ Extraindo ambiente portátil local..."
        mkdir -p "$PORTABLE_DIR"
        if [[ "$TAR_NAME" == *.tar.xz ]]; then
            tar -xJf "$TEMP_TAR" -C "$PORTABLE_DIR" --strip-components=1
        else
            tar -xzf "$TEMP_TAR" -C "$PORTABLE_DIR" --strip-components=1
        fi
        rm -f "$TEMP_TAR"
        echo "      ✓ Node.js portátil pronto em $PORTABLE_DIR"
    fi
    
    export PATH="$PORTABLE_DIR/bin:$PATH"
    NODE_BIN="$PORTABLE_DIR/bin/node"
    NPM_BIN="$PORTABLE_DIR/bin/npm"
fi

# 4. Atualizar dependências
echo ""
echo "[4/5] Instalando dependências atualizadas..."
"$NPM_BIN" install

# 5. Limpar cache antigo e compilar
echo ""
echo "[5/5] Compilando versão otimizada do Diário (npm run build)..."
rm -rf "$DIR/.next"
"$NPM_BIN" run build

# Garantir permissões de execução nos scripts
chmod +x "$DIR/iniciar_diario.sh" "$DIR/atualizar.sh" 2>/dev/null || true

echo ""
echo "========================================================"
echo " ✓ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo " Suas notas continuam 100% salvas e protegidas."
echo " Para iniciar o diário, execute:"
echo "   ./iniciar_diario.sh"
echo "========================================================"
