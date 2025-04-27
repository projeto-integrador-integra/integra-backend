#!/bin/bash
set -euo pipefail

echo "📦 Rodando build..."
npm run build

echo "✅ Build concluído."

if [ ! -d dist ]; then
  echo "❌ Pasta dist/ não encontrada. Build falhou?"
  exit 1
fi

echo "📁 Criando pasta build..."
rm -rf build
mkdir build

echo "📂 Copiando arquivos para build/"
cp -r dist package.json package-lock.json .env* build/

echo "📂 Instalando dependências para produção..."
cd build
npm install --omit=dev --omit=optional --omit=peer --ignore-scripts
cd ..

echo "🗜️  Gerando lambda.zip..."
cd build
zip -rq ../lambda.zip .
cd ..

echo "🧹 Limpando pasta temporária..."
rm -rf build

echo "✅ Build finalizada. Arquivo: lambda.zip"
