# Trello Discord Bot

Discord BotとTrello APIを連携し、Trelloボードの活動をDiscordチャンネルに通知するとともに、Discordから一部のTrello操作を可能にするアプリケーションです。

> **問題が発生した場合は？** [トラブルシューティングガイド](TROUBLESHOOTING.md)をご覧ください。特にDocker環境でのコマンド重複問題への対処法を記載しています。
>
> **セキュリティ情報**: 機密情報の取り扱いについては[セキュリティガイドライン](SECURITY.md)を必ず確認してください。

## 機能

現在実装されている機能:
- Trelloボードの通知を定期的にチェック
- 新しい通知をDiscordの指定チャンネルに送信
- 複数のTrelloボードに対応し、ボード間の切り替えが可能
- 以下のTrelloアクションに対応:
  - カード作成 (createCard)
  - カード更新/移動 (updateCard)
  - カードへのコメント (commentCard)
  - カードへのメンバー追加 (addedToCard)
- Discordスラッシュコマンド:
  - `/trello-help` - ヘルプを表示
  - `/trello-board` - ボード概要を表示
  - `/trello-lists` - リスト一覧を表示
  - `/trello-card create` - カードを作成
  - `/trello-card view` - カードを表示（リスト選択→カード選択の順に選べます）
  - `/trello-list-cards` - リスト内のカード一覧を表示
  - `/trello-board-select` - 使用するTrelloボードを選択または一覧表示

## Botの使用方法

### 基本コマンド
- `/trello-help` - 使用可能なコマンド一覧を表示します
- `/trello-board` - 連携されているTrelloボードの情報を表示します

### リスト・カード表示コマンド
- `/trello-lists` - ボード内のリスト一覧とそのIDを表示します
- `/trello-list-cards [list_id]` - 指定したリスト内のカード一覧を表示します
  - `list_id`: リストのIDを入力します (リスト一覧コマンドで確認できます)

### カード操作コマンド
- `/trello-card create` - 新しいカードを作成します
  - `list_id`: カードを作成するリストのIDを入力します
  - `name`: カード名を入力します
  - `description`: カードの説明を入力します (省略可)
- `/trello-card view` - カードの詳細を表示します
  - まず `list_id` でリストを選択します (表示される選択肢から選べます)
  - 次に `card_id` でカードを選択します (選択したリストのカードが選択肢として表示されます)
- `/trello-board-select` - 使用するTrelloボードを選択または一覧表示します
  - `board_id`: 選択するボードのIDを指定します（省略時は一覧表示）
  - ボードIDはオートコンプリートで選択可能です

> **注意**: オートコンプリートが表示されない場合は、Discordアプリを再起動するか、ボットの権限設定を確認してください。（特に `applications.commands` のスコープがBotに付与されているか確認してください）

## マルチボード対応

このBotは複数のTrelloボードを管理でき、動的にボードを切り替えて利用することができます。
ボードの選択や切り替えは以下の方法で行えます：

- `/trello-board-select` コマンドでボードを選択または一覧表示
- 自動的に利用可能なTrelloボードを検出（初回起動時）
- 前回使用したボードを記憶して次回起動時に自動的に選択

### ボード管理コマンド
- `/trello-board-select` - 使用するTrelloボードを選択または一覧表示します
  - `board_id`: 選択するボードのIDを指定します（省略時は一覧表示）
  - ボードIDはオートコンプリートで選択可能です

> **新機能**: 複数のボードを切り替えて使用できるようになりました。

## Docker環境での使用方法

このBotはDocker環境での実行を推奨しています。Docker Composeを使って簡単に起動できます。

### 本番環境での起動方法

1. `.env`ファイルを作成し、必要な環境変数を設定します：
   ```
   DISCORD_TOKEN=<Discordボットトークン>
   DISCORD_CHANNEL_ID=<通知を送信するチャンネルID>
   TRELLO_API_KEY=<TrelloのAPIキー>
   TRELLO_TOKEN=<Trelloトークン>
   ```

2. 以下のコマンドでボットを起動します：
   ```powershell
   docker-compose up -d
   # または付属のヘルパースクリプトを使用
   .\docker-helper.ps1
   ```

3. ボットの停止は以下のコマンドで行います：
   ```powershell
   docker-compose down
   # または
   .\docker-helper.ps1 -Stop
   ```

4. 初回起動時にはボットが自動的に利用可能なTrelloボードを検出します。設定は永続ボリュームに保存されるため、再起動しても維持されます。

### 開発環境での起動方法

1. `.env.dev`ファイルを作成し、開発用の環境変数を設定します

2. 開発モードで起動します：
   ```powershell
   docker-compose -f docker-compose.dev.yml up
   ```

### ボリュームについて

このボットは以下のDockerボリュームを使用します：

- `build-volume`: コンパイルされたJavaScriptファイルを保存します（コンテナ再起動時にビルドを保持）
- `config-volume`: ボード設定情報を保存します（選択したボードの情報を永続化）

データの永続化のため、これらのボリュームは自動的に作成・管理されます。

### 設定ファイルの保存場所

Docker環境では、設定ファイルは次の場所に保存されます：
- ボード設定: `/app/config/boardConfig.json`

> **注意**: Docker環境では設定ディレクトリのマウントが必要です。docker-compose.ymlファイルを確認し、`config-volume`が正しく設定されていることを確認してください。

## 開発予定の機能

### Trello連携機能
- **添付
### ステージ1: 基本通知機能 ✅
- Trelloボードの活動通知をDiscordに送信する基本機能

### ステージ2: 拡張通知と基本コマンド ✅
- 通知メッセージの強化（リッチエンべッド、リンク、画像など）
- 基本的なスラッシュコマンド実装

### Docker対応とマルチボード機能 ✅
- 複数のTrelloボードに対応
- Docker環境での設定永続化
- 設定ファイルのボリュームマウント

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

2. `.env.example`ファイルをコピーして`.env`ファイルを作成し、必要な環境変数を設定
```bash
# Discord Bot設定
DISCORD_TOKEN=あなたのDiscordボットトークン
DISCORD_CHANNEL_ID=通知を送信したいチャンネルのID
CLIENT_ID=DiscordボットのクライアントID
GUILD_ID=特定のサーバーにコマンドを登録する場合のID

# Trello API設定
TRELLO_API_KEY=TrelloのAPIキー
TRELLO_TOKEN=Trelloのトークン
TRELLO_BOARD_ID=監視したいTrelloボードID（オプション）
```

> **注意**: 
> - `TRELLO_BOARD_ID`はオプションになりました。設定しない場合は自動的に利用可能なボードを検出します。
> - 環境変数には機密情報が含まれるため、`.env`ファイルは必ず`.gitignore`に含め、リポジトリにコミットしないでください。
> - 詳細は[セキュリティガイドライン](SECURITY.md)を参照してください。

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

## Docker環境での技術詳細

### ボード設定の保存と永続化

このボットはDockerコンテナ内で動作する際、以下の仕組みでボード設定を永続化しています：

1. `config-volume` という名前のDockerボリュームを使用して設定ファイルを保存
2. 設定ファイルのパスは環境変数 `CONFIG_DIR` で指定可能（デフォルトは `/app/config`）
3. ボード設定ファイルは `boardConfig.json` という名前で保存
4. 初回実行時はTrello APIからボード一覧を取得して設定ファイルを作成

ボード設定ファイルの形式は以下の通りです：
```json
{
  "activeBoardId": "選択されたボードのID", 
  "recentBoards": [
    {
      "id": "ボードID",
      "name": "ボード名",
      "lastUsed": "最終使用日時（ISO形式）"
    },
    ...
  ]
}
```

### Docker環境での設定ディレクトリ

Docker環境では、以下の環境変数を設定することで保存先を変更可能です：
```
CONFIG_DIR=/path/to/config
```

Dockerfile内で `ENV CONFIG_DIR="/app/config"` としてデフォルト値を設定しています。

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

# Docker ボリューム一覧の表示
.\docker-helper.ps1 -Volumes

# 設定ボリュームの内容確認
.\docker-helper.ps1 -Config
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

## インストールと設定

### 前提条件
- Node.js 16.0.0以上
- Discord Bot Token
- Trello APIキーとトークン

### Discord Developer Portalでの設定
1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 新規アプリケーションを作成、または既存のアプリケーションを選択
3. 「Bot」タブで、以下の設定を行います：
   - `Privileged Gateway Intents` セクションで以下を有効化：
     - `SERVER MEMBERS INTENT` (必要に応じて)
     - `MESSAGE CONTENT INTENT` (メッセージ内容にアクセスする場合)
   - `Bot Permissions` で必要な権限を設定：
     - `Send Messages`
     - `Embed Links`
     - `Read Message History`
     - `Use Slash Commands`
     - `Use Application Commands` (スラッシュコマンドとオートコンプリートに必須)
   - `PUBLIC BOT` をオンにする (複数サーバーで使用する場合)
4. `OAuth2` > `URL Generator` で以下の設定を行います：
   - `SCOPES`で次のものを選択：
     - `bot`
     - `applications.commands` (スラッシュコマンド用に必須)
   - `BOT PERMISSIONS`で必要な権限を選択
5. 生成されたURLからBotをサーバーに追加する
6. トークンをコピーして`.env`ファイルに設定

### Trello APIの設定
1. [Trello Developer API Keys](https://trello.com/app-key)にアクセス
2. APIキーとトークンを取得
3. `.env`ファイルに設定

### 環境変数の設定
`.env`ファイルを作成し、以下の環境変数を設定:

```env
DISCORD_TOKEN=あなたのDiscord Botトークン
DISCORD_CHANNEL_ID=通知を送信するチャンネルID
TRELLO_API_KEY=TrelloのAPIキー
TRELLO_TOKEN=Trelloトークン
TRELLO_BOARD_ID=監視対象のTrelloボードID
```

## トラブルシューティング

### オートコンプリートの問題
- **問題**: オートコンプリートが機能しない
- **解決策**: 以下を確認してください
  1. Discordの権限で `applications.commands` スコープが付与されているか確認
  2. Discord Developer Portalの「Bot」タブで「Message Content Intent」が有効になっているか確認
  3. Discord Developer Portalの「OAuth2」>「URL Generator」で正しい権限を持つ招待リンクを再生成
  4. Discordアプリを再起動する

### カードビューコマンドの問題
- **問題**: `trello-card view` だけでは使用できず、`card_id`を指定するように言われる
- **解決策**: このコマンドは2段階で使用します
  1. まず`list_id`パラメータを選択（オートコンプリートから選べます）
  2. 次に`card_id`パラメータを選択（選んだリストのカードがオートコンプリートで表示）

### IDの表示問題
- **問題**: IDが短く省略されて使いにくい
- **解決策**: 最新バージョンでは完全なIDが表示されるようになりました

### その他の問題
Botが正常に動作しない場合は、以下を確認してください：
- すべての環境変数が正しく設定されているか
- ボットがサーバーのメンバーになっているか
- 必要な権限がすべて付与されているか

## Use Application Commands

Discordのアプリケーションコマンド（スラッシュコマンド）を使用するための設定方法です。

### アプリケーションコマンドの有効化

1. Discord Developer Portalにアクセス
2. 「OAuth2」>「URL Generator」で以下の設定を行います：
   - `SCOPES`で次のものを選択：
     - `bot`
     - `applications.commands` (スラッシュコマンド用に必須)
   - `BOT PERMISSIONS`で必要な権限を選択
3. 生成されたURLを使用してBotをサーバーに追加（または再追加）してください
   - **重要**: すでにBotがサーバーに追加されている場合でも、`applications.commands`スコープを追加するには再招待が必要です

### コマンドの使用方法

1. Discordのメッセージ入力欄で `/` を入力すると、利用可能なスラッシュコマンドが表示されます
2. `/trello-` で始まるコマンドを選択してください
3. コマンドに必要なパラメータを入力して実行します

### トラブルシューティング

- コマンドが表示されない場合、以下を確認してください：
  1. Botに `applications.commands` スコープが付与されていること
  2. 適切な権限が設定されていること
  3. Discordアプリを再起動してみる（スラッシュコマンドのリフレッシュに有効です）
- スラッシュコマンドの反映には最大1時間程度かかることがあります