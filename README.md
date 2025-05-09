# Trello Discord Bot

Discord BotとTrello APIを連携し、Trelloボードの活動をDiscordチャンネルに通知するとともに、Discordから一部のTrello操作を可能にするアプリケーションです。

## 機能

現在実装されている機能:
- Trelloボードの通知を定期的にチェック
- 新しい通知をDiscordの指定チャンネルに送信
- 以下のTrelloアクションに対応:
  - カード作成 (createCard)
  - カード更新/移動 (updateCard)
  - カードへのコメント (commentCard)
  - カードへのメンバー追加 (addedToCard)

## 開発予定の機能

### Trello連携機能
- **添付ファイルセクション**: カードの裏面でiframeを通じて関連コンテンツをレンダリング
- **添付ファイルサムネイル**: 添付ファイルに関する追加情報の提供
- **カードの裏面セクション**: カード裏面でのカスタムコンテンツ表示
- **カードバッジ**: カードの表面に一目でわかる情報を表示
- **カードボタン**: ユーザーがカードに対して直接アクションを起こせる機能
- **カード詳細バッジ**: カード表面上部に色付けされた情報表示
- **URLカード作成**: 特定URLからの有用なカード自動生成機能
- **URL形式変換**: カード説明やコメント内のURLを読みやすく整形
- **リスト操作/ソート**: カスタムリストアクションとソートオプションの追加

### Discord Bot機能
- スラッシュコマンドによるTrelloボード閲覧
- カード作成コマンド (`/card create`)
- カード検索コマンド (`/card search`)
- リスト一覧表示コマンド (`/list view`)
- メンバーへのタスク割り当て (`/assign`)
- 期限日の設定と通知 (`/due`)
- Trelloボードの統計情報表示 (`/stats`)

## 実装ステージ

本プロジェクトは段階的に機能を実装していく予定です:

### ステージ1: 基本通知機能 ✅
- Trelloボードの活動通知をDiscordに送信する基本機能

### ステージ2: 拡張通知と基本コマンド 🔄
- 通知メッセージの強化（リッチエンべッド、リンク、画像など）
- 基本的なスラッシュコマンド実装

### ステージ3: 双方向連携 🔜
- Discordからのカード作成・編集機能
- メンバー割り当てやコメント追加機能

### ステージ4: 高度な機能 🔜
- Power-Up機能の活用による拡張機能
- カスタムビューやダッシュボード機能

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

## 詳細ドキュメント

プロジェクトの詳細な設計と実装計画については、以下のドキュメントを参照してください：

- [Trello API 機能ドキュメント](./docs/TRELLO_API.md) - Trello APIの利用方法と機能の詳細
- [Discord Bot 設計ドキュメント](./docs/DISCORD_BOT_DESIGN.md) - Discord Bot実装の詳細設計

## 実装ロードマップ

本プロジェクトは以下のステップで段階的に実装を進めていきます：

1. **基本通知機能の強化** (現在)
   - リッチな通知メッセージ (Embedの利用)
   - 通知フィルタリング機能
   - エラーハンドリングの改善

2. **Discord Bot コマンドの実装** (次期開発)
   - スラッシュコマンド基盤作成
   - 基本的なボード・カード操作

3. **双方向連携の強化** (将来)
   - リアクションによるカード操作
   - Discordからの完全なTrello操作

4. **Trello Power-Up連携** (最終段階)
   - カスタム表示機能
   - 高度な連携機能

各ステップは個別のマイルストーンとして管理し、段階的にリリースしていく予定です。