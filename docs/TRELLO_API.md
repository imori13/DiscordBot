# Trello API 機能ドキュメント

このドキュメントでは、本プロジェクトで利用するTrello APIの主要な機能と、Discord Botとの連携方法について説明します。

## Trello API 基本情報

### 認証方法
Trello APIを利用するには、APIキーとトークンが必要です。
- APIキー: [Trello API Key](https://trello.com/app-key) から取得できます
- トークン: APIキーページからトークンを生成できます
- 認証方法: `?key={YOUR_API_KEY}&token={YOUR_TOKEN}` をリクエストに追加

### 基本エンドポイント
- Trello API Base URL: `https://api.trello.com/1/`
- ボード情報取得: `https://api.trello.com/1/boards/{boardId}`
- カード情報取得: `https://api.trello.com/1/cards/{cardId}`
- リスト情報取得: `https://api.trello.com/1/lists/{listId}`

## 基本的なTrello操作APIとBot実装

### 1. 通知の取得
```typescript
// メンバーの通知を取得
GET https://api.trello.com/1/members/me/notifications

// 実装コード
async function checkTrelloNotifications(): Promise<void> {
  try {
    const response = await axios.get<TrelloNotification[]>(
      `https://api.trello.com/1/members/me/notifications?key=${trelloApiKey}&token=${trelloToken}`
    );
    // 通知処理...
  } catch (error) {
    console.error('Trello通知の取得に失敗しました:', error);
  }
}
```

### 2. ボード情報の取得
```typescript
// ボード情報を取得
GET https://api.trello.com/1/boards/{boardId}?fields=name,url,desc

// 実装予定コード
async function getBoardInfo(boardId: string): Promise<TrelloBoard> {
  const response = await axios.get(
    `https://api.trello.com/1/boards/${boardId}?key=${trelloApiKey}&token=${trelloToken}&fields=name,url,desc`
  );
  return response.data;
}
```

### 3. リスト一覧取得
```typescript
// ボード内のリスト一覧取得
GET https://api.trello.com/1/boards/{boardId}/lists

// 実装予定コード
async function getBoardLists(boardId: string): Promise<TrelloList[]> {
  const response = await axios.get(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${trelloApiKey}&token=${trelloToken}`
  );
  return response.data;
}
```

### 4. カードの作成
```typescript
// 新しいカードを作成
POST https://api.trello.com/1/cards
{
  "idList": "リストID",
  "name": "カード名",
  "desc": "説明"
}

// 実装予定コード
async function createCard(listId: string, name: string, description?: string): Promise<TrelloCard> {
  const response = await axios.post(
    `https://api.trello.com/1/cards?key=${trelloApiKey}&token=${trelloToken}`,
    {
      idList: listId,
      name: name,
      desc: description || ''
    }
  );
  return response.data;
}
```

### 5. カードへのコメント追加
```typescript
// カードにコメント追加
POST https://api.trello.com/1/cards/{cardId}/actions/comments
{
  "text": "コメント内容"
}

// 実装予定コード
async function addCommentToCard(cardId: string, comment: string): Promise<void> {
  await axios.post(
    `https://api.trello.com/1/cards/${cardId}/actions/comments?key=${trelloApiKey}&token=${trelloToken}`,
    { text: comment }
  );
}
```

## Trello Power-Up機能

Trello Power-Up機能は、Trelloの拡張機能を提供するフレームワークです。以下の機能をDiscord Botと連携することで、より豊かな体験を提供できます。

### 添付ファイルセクション (`attachment-sections`)
カードの裏面でiframeを通じて関連コンテンツをレンダリングします。これにより、特定のURLに関連するコンテンツをカード内に直接表示できます。

**Bot実装構想**: Discordの特定メッセージをTrelloカードに添付するとき、そのメッセージのプレビューを表示。

### カードの裏面セクション (`card-back-section`)
カードの裏面にカスタムセクションを追加できます。

**Bot実装構想**: 関連するDiscordの会話スレッドや決定事項をカード裏面に表示。

### カードのバッジ (`card-badges`)
カードの表面に情報を一目で分かるように表示します。アイコンやテキスト、色などをカスタマイズ可能。

**Bot実装構想**: Discordでの未読メッセージ数や関連タスクのステータスをバッジとして表示。

### カードボタン (`card-buttons`)
カードに対して直接アクションを起こすためのボタンを追加します。

**Bot実装構想**: 「Discordで議論」ボタンを追加し、クリック時に関連Discordチャンネルを開く機能。

### カード詳細バッジ (`card-detail-badges`)
カード表面の上部に情報を表示でき、色付けしたり動的に変更したりできます。

**Bot実装構想**: プロジェクトの進行状況や優先度を色分けして表示。

### URLからのカード (`card-from-url`)
URLをドラッグ＆ドロップするとカードを自動生成する機能。

**Bot実装構想**: DiscordのメッセージURLからTrelloカードを作成し、会話内容を要約して取り込む機能。

### URL形式 (`format-url`)
URLを整形して表示する機能。

**Bot実装構想**: DiscordのURLが含まれる場合、チャンネル名やメッセージプレビューを表示。

### リスト操作 (`list-actions`)
リストに新しいアクションオプションを追加します。

**Bot実装構想**: 「Discordに通知」ボタンを追加し、リストの変更をDiscordチャンネルに一括通知。

### リストソーター (`list-sorters`)
リストのソート順をカスタマイズする機能。

**Bot実装構想**: Discordでの言及回数やアクティビティに基づいてカードをソート。

## Discord Bot インテグレーション計画

本プロジェクトでは、上記のTrello API機能とDiscord Botを以下のように統合していきます：

1. **通知連携システム**
   - Trelloの通知をDiscordに転送
   - Discordでの議論をTrelloにフィードバック

2. **コマンドインターフェース**
   - `/trello view` - ボードの概要表示
   - `/trello card create` - カード作成
   - `/trello card move` - カードの移動
   - `/trello assign` - メンバー割り当て

3. **リアクションベースの操作**
   - 特定のリアクションでカードステータス変更
   - リアクションによるラベル追加・削除

4. **高度な連携**
   - Discordの会話からトピック抽出してカード化
   - 締め切り近いカードの自動リマインド

---

このドキュメントは開発の進行に合わせて更新されます。
