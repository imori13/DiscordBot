# Discord Bot 設計ドキュメント

## 概要

このDiscord BotはTrelloとDiscordの連携を強化し、チームのプロジェクト管理をより効率的に行うためのツールです。TrelloのタスクをDiscordで確認したり、Discordから直接Trelloのタスクを管理したりすることができます。

## 基本設計

### アーキテクチャ

```
                  +--------------+
                  |              |
+----------+      |   Discord    |      +-----------+
|          |      |     Bot      |      |           |
|  Trello  +------+  (Node.js/   +------+  Discord  |
|   API    |      |  TypeScript) |      |  サーバー  |
|          |      |              |      |           |
+----------+      +--------------+      +-----------+
                         |
                  +--------------+
                  |   設定ファイル  |
                  | (Docker Volume)|
                  +--------------+
```

- **バックエンド**: Node.js & TypeScript
- **デプロイ**: Docker コンテナ
- **通信**: Discord API, Trello API (REST)
- **スケジューリング**: node-schedule
- **状態管理**: Bot内メモリ + 設定ファイルでの永続化
- **データ保存**: Dockerボリュームによる永続化

### システム要件

- Discord Bot Token
- Discord Client ID (コマンド登録用)
- Discord Guild ID (オプション、特定サーバー用)
- Trello API Key & Token
- 監視対象のTrelloボードID
- 通知送信先のDiscordチャンネルID

## 機能設計

### 1. 基本的な通知機能 (現在実装済み)

- Trelloボードの通知をポーリングで定期取得
- 新しい通知をDiscordチャンネルにテキストメッセージとして転送
- サポートする通知タイプ:
  - カード作成 (createCard)
  - カード更新/移動 (updateCard)
  - カードへのコメント (commentCard)
  - カードへのメンバー追加 (addedToCard)

### 2. リッチ通知機能 (実装予定)

Discord Embedを使用してリッチな表示を行います：

```typescript
// リッチな通知の実装例
function createRichNotificationEmbed(notification: TrelloNotification): EmbedBuilder {
  const data = notification.data;
  const embed = new EmbedBuilder()
    .setColor('#0079BF') // Trelloのブルー
    .setAuthor({
      name: notification.memberCreator.fullName,
      iconURL: `https://trello-members.s3.amazonaws.com/${notification.memberCreator.username}.png`
    })
    .setTimestamp(new Date(notification.date))
    .setFooter({ text: 'Trello', iconURL: 'https://trello.com/favicon.ico' });
  
  // 通知タイプに応じた情報設定
  switch (notification.type) {
    case 'commentCard':
      embed
        .setTitle(`💬 ${data.card?.name || '不明なカード'}へのコメント`)
        .setDescription(data.text || '');
      break;
    
    case 'createCard':
      embed
        .setTitle(`➕ カード作成: ${data.card?.name || '不明なカード'}`)
        .setDescription(`リスト: ${data.list?.name || '不明'}`);
      break;
    
    // 他の通知タイプも同様に...
  }
  
  // カードへのリンクを追加
  if (data.card) {
    embed.setURL(`https://trello.com/c/${data.card.id}`);
  }
  
  return embed;
}
```

### 3. スラッシュコマンド (実装済み)

Discord APIのInteraction機能を使用したスラッシュコマンド：

#### コマンド一覧

```
/trello help - ヘルプ表示
/trello board - ボードの概要表示
/trello list - リスト一覧表示
/trello card create - 新規カード作成
/trello card move - カードの移動
/trello card assign - メンバー割り当て
/trello due - 期限日設定
/trello stats - ボード統計
```

#### 実装例

```typescript
// スラッシュコマンド処理の例
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'trello') {
    const subcommand = options.getSubcommand();
    
    switch(subcommand) {
      case 'board':
        await handleBoardCommand(interaction);
        break;
      case 'card':
        const cardAction = options.getSubcommandGroup();
        switch(cardAction) {
          case 'create':
            await handleCardCreateCommand(interaction);
            break;
          case 'move':
            await handleCardMoveCommand(interaction);
            break;
          // その他のサブコマンド...
        }
        break;
      // 他のサブコマンド...
    }
  }
});

async function handleCardCreateCommand(interaction) {
  // カード名を取得
  const cardName = interaction.options.getString('name');
  const listId = interaction.options.getString('list');
  const description = interaction.options.getString('description') || '';
  
  try {
    // Trello APIでカード作成
    const card = await createCard(listId, cardName, description);
    
    // 成功レスポンス
    await interaction.reply({
      content: `✅ カード「${cardName}」を作成しました！`,
      embeds: [
        new EmbedBuilder()
          .setTitle(cardName)
          .setDescription(description || '説明なし')
          .setColor('#0079BF')
          .setURL(`https://trello.com/c/${card.id}`)
      ]
    });
  } catch (error) {
    console.error('カード作成エラー:', error);
    await interaction.reply({
      content: '❌ カードの作成に失敗しました。',
      ephemeral: true
    });
  }
}
```

### 4. リアクションベースのインタラクション (実装予定)

特定のエモジリアクションでTrelloカードを操作：

```typescript
// リアクション処理の例
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return; // ボットのリアクションは無視
  
  const message = reaction.message;
  const emoji = reaction.emoji.name;
  
  // TrelloカードのURLを含むメッセージかチェック
  const cardIdMatch = message.content.match(/https:\/\/trello.com\/c\/([a-zA-Z0-9]+)/);
  if (!cardIdMatch) return;
  
  const cardId = cardIdMatch[1];
  
  // 絵文字に基づいて処理
  switch (emoji) {
    case '✅': // 完了マーク
      await moveCardToList(cardId, DONE_LIST_ID);
      break;
    case '🔄': // 進行中マーク
      await moveCardToList(cardId, IN_PROGRESS_LIST_ID);
      break;
    case '👤': // 自分にアサイン
      await assignCardToMember(cardId, await getTrelloMemberId(user.id));
      break;
    // 他のリアクション...
  }
});
```

## 開発ロードマップ

### フェーズ1: 基盤強化 (完了)
- 現行の通知システム最適化
- ログ機能の強化
- エラーハンドリングの改善
- テスト環境構築
- Docker環境整備

### フェーズ2: リッチ通知実装 (完了)
- Discord Embedを使用した見やすい通知
- カードのサムネイル・リンク表示
- テキストフォーマットの改善

### フェーズ3: 基本コマンド実装 (完了)
- スラッシュコマンド基盤作成
- ボード・リスト表示機能
- カード作成・移動機能
- マルチボード対応

### フェーズ4: 高度なインタラクション
- リアクションベースの操作
- カードへのコメント・添付
- メンバー管理・期限設定

### フェーズ5: Trello Power-Up連携
- カスタムバッジ・カードボタン実装
- Discordメッセージからカード作成
- 高度な可視化・統計機能

## データモデル拡張予定

現在の型定義に加えて、以下の追加が必要です：

```typescript
// Discord関連の型定義
interface DiscordUserMapping {
  discordId: string;
  trelloMemberId: string;
}

// コマンド設定の型定義
interface TrelloCommandConfig {
  boardId: string;
  defaultListId: string;
  notificationChannelId: string;
  adminRoleId: string;
}

// ボード統計の型定義
interface BoardStatistics {
  cardCount: number;
  listsBreakdown: { [listName: string]: number };
  memberActivity: { [memberName: string]: number };
  completedLast7Days: number;
}
```

## セキュリティ考慮事項

- Trello API KeyとTokenの安全な保管
- ユーザー権限の適切な検証
- コマンド利用者の制限とロギング
- APIレートリミットの考慮

---

このドキュメントは開発の進行に合わせて更新されます。
