#!/usr/bin/env bash

# ==============================================================================
# Diário Mágicko Thelêmico — Script de Inicialização Autônoma para Linux & macOS
# Não requer instalação prévia de Node.js ou NPM no sistema operacional.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "========================================================"
echo " 🌟 DIÁRIO MÁGICKO THELÊMICO — THELEMA OBSIDIAN EDITION"
echo " 'O Método da Ciência, o Objetivo da Religião.'"
echo "========================================================"
echo ""

# 1. Verificar se Node e NPM já existem no sistema
NODE_BIN=""
NPM_BIN=""

if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    NODE_VERSION=$(node -v | tr -d 'v' | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo "✓ Node.js detectado no sistema: $(node -v)"
        NODE_BIN="node"
        NPM_BIN="npm"
    fi
fi

# 2. Se não houver Node >= 18 no sistema, usar/baixar Node.js portátil local
if [ -z "$NODE_BIN" ]; then
    PORTABLE_DIR="$DIR/.node-linux"
    
    if [ -x "$PORTABLE_DIR/bin/node" ] && [ -x "$PORTABLE_DIR/bin/npm" ]; then
        echo "✓ Usando Node.js portátil local em $PORTABLE_DIR"
    else
        echo "➜ Node.js não encontrado no sistema. Baixando versão portátil oficial (independente)..."
        ARCH=$(uname -m)
        NODE_VER="v22.14.0"
        
        if [ "$ARCH" = "x86_64" ]; then
            TAR_NAME="node-${NODE_VER}-linux-x64.tar.xz"
        elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
            TAR_NAME="node-${NODE_VER}-linux-arm64.tar.xz"
        else
            echo "❌ Arquitetura '$ARCH' não suportada automaticamente para download portátil."
            echo "Por favor, instale o Node.js v18+ via gerenciador de pacotes da sua distribuição (ex: sudo apt install nodejs npm)."
            exit 1
        fi
        
        DOWNLOAD_URL="https://nodejs.org/dist/${NODE_VER}/${TAR_NAME}"
        TEMP_TAR="/tmp/${TAR_NAME}"
        
        echo "➜ Fazendo download do Node.js portátil de: $DOWNLOAD_URL"
        if command -v curl >/dev/null 2>&1; then
            curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_TAR"
        elif command -v wget >/dev/null 2>&1; then
            wget -q "$DOWNLOAD_URL" -O "$TEMP_TAR"
        else
            echo "❌ curl ou wget não encontrados para download. Instale curl ou nodejs no sistema."
            exit 1
        fi
        
        echo "➜ Extraindo ambiente portátil local..."
        mkdir -p "$PORTABLE_DIR"
        tar -xJf "$TEMP_TAR" -C "$PORTABLE_DIR" --strip-components=1
        rm -f "$TEMP_TAR"
        echo "✓ Node.js portátil instalado com sucesso em $PORTABLE_DIR"
    fi
    
    export PATH="$PORTABLE_DIR/bin:$PATH"
    NODE_BIN="$PORTABLE_DIR/bin/node"
    NPM_BIN="$PORTABLE_DIR/bin/npm"
fi

# 3. Verificar dependências (node_modules)
if [ ! -d "$DIR/node_modules" ]; then
    echo ""
    echo "➜ Instalando dependências do projeto pela primeira vez (aguarde alguns instantes)..."
    "$NPM_BIN" install
fi

# 4. Verificar se a compilação existe, senão compilar
if [ ! -d "$DIR/.next" ]; then
    echo ""
    echo "➜ Compilando o Diário Mágicko para produção..."
    "$NPM_BIN" run build
fi

# 5. Abrir navegador automaticamente em segundo plano
(
    sleep 3
    URL="http://localhost:3000"
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" >/dev/null 2>&1 || true
    elif command -v open >/dev/null 2>&1; then
        open "$URL" >/dev/null 2>&1 || true
    elif command -v google-chrome >/dev/null 2>&1; then
        google-chrome "$URL" >/dev/null 2>&1 || true
    elif command -v firefox >/dev/null 2>&1; then
        firefox "$URL" >/dev/null 2>&1 || true
    fi
) &

echo ""
echo "🚀 Servidor do Diário Mágicko iniciando na porta 3000..."
echo "Acesse no navegador: http://localhost:3000"
echo "Pressione Ctrl+C para encerrar o servidor."
echo ""

# Inicia o servidor Next.js
exec "$NPM_BIN" run start
