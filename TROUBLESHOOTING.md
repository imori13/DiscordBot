# トラブルシューティング

## スラッシュコマンドの重複問題

Dockerの再ビルドや再起動後にDiscordでスラッシュコマンドが重複して表示される場合があります。これは、コマンド登録の際に古いコマンドが完全に削除されていないことが原因です。

この問題を解決するには、以下の手順を実行してください：

### 1. .envファイルの設定

`.env`ファイルや`.env.dev`ファイルにボットのクライアントIDを追加します：

```
CLIENT_ID=あなたのボットのクライアントID
```

クライアントIDはDiscord Developer Portalの「OAuth2」タブから取得できます。

### 2. コマンドクリアスクリプトの実行

以下のコマンドを実行してスラッシュコマンドを完全にクリアします：

```bash
cd C:\iMori\Project\DiscordBot
npx ts-node scripts/clear-commands.ts
```

### 3. ボットの再起動

コマンドをクリアした後、ボットを再起動します：

```bash
npm run dev
# または
docker-compose -f docker-compose.dev.yml up -d
```

これで、スラッシュコマンドが正しく一度だけ表示されるようになるはずです。

## Docker環境での注意点

Docker環境でボットを実行する場合、コンテナの再起動時に同じコマンドが重複して登録されることがあります。これを防ぐために、以下の点に注意してください：

1. `.env`ファイル（または`.env.dev`）に`CLIENT_ID`を設定してあることを確認
2. コマンド登録に問題が発生した場合は、`scripts/clear-commands.ts`を実行してからボットを再起動
3. Dockerコンテナを完全に再構築するには以下を実行：

```bash
# 開発環境の場合
.\docker-helper.ps1 -Dev -Stop
.\docker-helper.ps1 -Dev -Build

# 本番環境の場合
.\docker-helper.ps1 -Stop
.\docker-helper.ps1 -Build
```
