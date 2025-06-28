@echo off
chcp 65001 > nul

REM MyRadiko 起動スクリプト (Windows)
REM サーバーとクライアントを同時起動します

echo 🎵 MyRadiko を起動しています...
echo.

REM Node.js がインストールされているかチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js がインストールされていません
    echo Node.js をインストールしてから再実行してください
    pause
    exit /b 1
)

REM npm がインストールされているかチェック
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm がインストールされていません
    echo npm をインストールしてから再実行してください
    pause
    exit /b 1
)

REM package.json が存在するかチェック
if not exist "package.json" (
    echo ❌ package.json が見つかりません
    echo プロジェクトのルートディレクトリで実行してください
    pause
    exit /b 1
)

REM 依存関係がインストールされているかチェック
if not exist "node_modules" (
    echo 📦 バックエンドの依存関係をインストールしています...
    npm install
)

if not exist "client\node_modules" (
    echo 📦 フロントエンドの依存関係をインストールしています...
    cd client
    npm install
    cd ..
)

REM データベースの初期化チェック
if not exist "data\myradiko.db" (
    echo 🗄️ データベースを初期化しています...
    npm run db:init
)

REM ディレクトリ作成
if not exist "data" mkdir data
if not exist "recordings" mkdir recordings
if not exist "logs" mkdir logs

echo.
echo 🚀 サーバーとクライアントを起動します...
echo 📻 バックエンド: http://localhost:3010
echo 🖥️ フロントエンド: http://localhost:5174
echo.
echo 停止するには Ctrl+C を押してください
echo.

REM サーバーとクライアントを同時起動
npm run dev

pause