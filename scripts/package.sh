#!/bin/bash
set -euo pipefail

echo "📦 Rodando build..."
npm run build

echo "📁 Criando pasta build..."
rm -rf build
mkdir build

echo "📂 Copiando arquivos para build/"
cp -r dist package.json node_modules .env* build/ 2>/dev/null || true

echo "🗜️  Gerando lambda.zip..."
cd build
zip -rq ../lambda.zip .
cd ..

echo "🧹 Limpando pasta temporária..."
rm -rf build

echo "✅ Build finalizada. Arquivo: lambda.zip"
