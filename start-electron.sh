#!/bin/bash

# MyRadiko Electron アプリ起動スクリプト

echo "🖥️ MyRadiko Electron アプリを起動しています..."
echo ""

# Node.js がインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません"
    echo "Node.js をインストールしてから再実行してください"
    exit 1
fi

# npm がインストールされているかチェック
if ! command -v npm &> /dev/null; then
    echo "❌ npm がインストールされていません"
    echo "npm をインストールしてから再実行してください"
    exit 1
fi

# package.json が存在するかチェック
if [ ! -f "package.json" ]; then
    echo "❌ package.json が見つかりません"
    echo "プロジェクトのルートディレクトリで実行してください"
    exit 1
fi

# 依存関係がインストールされているかチェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストールしています..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 フロントエンドの依存関係をインストールしています..."
    cd client && npm install && cd ..
fi

# フロントエンドをビルド
echo "🔨 フロントエンドをビルドしています..."
npm run build

# データベースの初期化チェック
if [ ! -f "data/myradiko.db" ]; then
    echo "🗄️ データベースを初期化しています..."
    npm run db:init
fi

# ディレクトリ作成
mkdir -p data recordings logs

echo ""
echo "🚀 MyRadiko Electron アプリを起動します..."
echo "📻 デスクトップアプリケーションとして動作します"
echo ""

# Electronアプリを起動
npm run electron