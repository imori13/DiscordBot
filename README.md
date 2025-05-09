# Trello Discord Bot

Discord Botを利用してTrelloの通知をDiscordチャンネルに転送するアプリケーションです。

## 機能

- Trelloボードの通知を定期的にチェック
- 新しい通知をDiscordの指定チャンネルに送信
- カード作成、移動、コメント追加などの主要なTrelloアクションに対応

## セットアップ方法

1. 必要な依存関係をインストール
```bash
npm install
```

2. `.env.example`ファイルをコピーして`.env`ファイルを作成し、以下の環境変数を設定
```
DISCORD_TOKEN=あなたのDiscordボットトークン
DISCORD_CHANNEL_ID=通知を送信したいチャンネルのID
TRELLO_API_KEY=TrelloのAPIキー
TRELLO_TOKEN=Trelloのトークン
TRELLO_BOARD_ID=監視したいTrelloボードID
```

3. TypeScriptをビルド
```bash
npm run build
```

4. Botを起動
```bash
npm start
```

開発モードで起動する場合:
```bash
npm run dev
```

## 環境変数の取得方法

### Discord関連
- Discord Developer Portalでアプリケーションを作成しBotトークンを取得
- Discordの開発者モードを有効にし、通知を送信したいチャンネルのIDをコピー

### Trello関連
- [Trello API Key](https://trello.com/app-key)からAPIキーとトークンを取得
- 監視したいボードのURLから`https://trello.com/b/XXXX/board-name.json`で開かれる先頭のIDを取得

## Docker Composeによる実行

このプロジェクトには Docker 環境での実行をサポートするヘルパースクリプト (`docker-helper.ps1`) が含まれています。PowerShell で以下のように実行できます：

```powershell
# 本番環境でのコンテナ起動
.\docker-helper.ps1

# ビルドしながらコンテナ起動
.\docker-helper.ps1 -Build

# 開発環境でのコンテナ起動
.\docker-helper.ps1 -Dev

# 開発環境でのビルド&起動
.\docker-helper.ps1 -Dev -Build

# コンテナのログ表示
.\docker-helper.ps1 -Logs
# または開発環境のログ
.\docker-helper.ps1 -Dev -Logs

# コンテナの停止
.\docker-helper.ps1 -Stop
# または開発環境の停止
.\docker-helper.ps1 -Dev -Stop

# コンテナの再起動
.\docker-helper.ps1 -Restart
# または開発環境の再起動
.\docker-helper.ps1 -Dev -Restart
```

### 本番環境

手動で Docker コマンドを実行する場合：

```bash
# コンテナをビルドして起動
docker-compose up -d --build

# ログの確認
docker-compose logs -f

# コンテナの停止
docker-compose down
```

### 開発環境

手動で Docker コマンドを実行する場合：

```bash
# 開発環境用の.env.devファイルを作成
cp .env.dev.example .env.dev
# .env.devファイルを適切に編集

# 開発用コンテナをビルドして起動
docker-compose -f docker-compose.dev.yml up -d --build

# ログの確認
docker-compose -f docker-compose.dev.yml logs -f

# コンテナの停止
docker-compose -f docker-compose.dev.yml down
```

## GitHub 連携

このプロジェクトを GitHub リポジトリに接続する手順は [GITHUB_SETUP.md](./GITHUB_SETUP.md) を参照してください。