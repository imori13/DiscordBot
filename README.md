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