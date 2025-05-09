import dotenv from 'dotenv';
import { 
  Client, 
  GatewayIntentBits, 
  TextChannel, 
  EmbedBuilder, 
  Events,
  REST,
  Routes,
  ActivityType,
  MessageCreateOptions
} from 'discord.js';
import schedule from 'node-schedule';
import { TrelloNotification, TrelloList, TrelloCard } from './types';
import { getRecentNotifications, getTrelloBoardLists, getTrelloListCards } from './trello-api';
import { commands, commandHandlers } from './commands';

// 環境変数の読み込み
dotenv.config();

// 設定
const POLL_INTERVAL = '*/5 * * * *'; // 5分ごとにチェック
const discordChannelId = process.env.DISCORD_CHANNEL_ID || '';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';

// 環境変数のバリデーション
if (!DISCORD_TOKEN || !discordChannelId) {
  console.error('環境変数が正しく設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// Discordクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// 最後にチェックした通知のID
let lastNotificationId: string = '';

// Discord Botの起動時処理
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ ${readyClient.user.tag} としてログインしました`);
  
  // ステータス設定
  client.user?.setActivity('Trelloボードを監視中', { type: ActivityType.Watching });
  
  // ボードの初期化
  try {
    const { initializeBoardId, getAllBoards } = await import('./trello-boards');
    const boardId = await initializeBoardId();
    
    if (boardId) {
      console.log(`✅ Trelloボード初期化完了: ${boardId}`);
      console.log(`💡 ボード選択コマンド /trello-board-select で別のボードに切り替えることができます`);
      
      // 利用可能なボードの数をチェック
      try {
        const boards = await getAllBoards();
        if (boards.length > 1) {
          console.log(`🔍 ${boards.length}個の利用可能なボードが見つかりました`);
        }
      } catch (error) {
        // ボード数のチェックに失敗しても続行
      }
    } else {
      console.warn('⚠️ 有効なボードが見つかりません。/trello-board-select コマンドでボードを選択してください');
    }
  } catch (error) {
    console.error('Trelloボード初期化エラー:', error);
  }
  
  // スラッシュコマンドを登録
  await registerCommands();

  // 定期的にTrelloの通知をチェック
  schedule.scheduleJob(POLL_INTERVAL, checkTrelloNotifications);
  
  // 起動時にも一度チェック
  checkTrelloNotifications();
});

// スラッシュコマンドの登録
async function registerCommands() {
  try {
    console.log('スラッシュコマンドを登録中...');
    
    const commandsData = commands.map(command => command.data.toJSON());
    
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    
    // Docker環境でコマンドの重複を防ぐため、既存のコマンドを削除
    console.log('既存のコマンドをクリア中...');
    
    // グローバルコマンドを完全にクリア（必ず実行）
    try {
      await rest.put(
        Routes.applicationCommands(client.user!.id),
        { body: [] }
      );
      console.log('グローバルコマンドをクリアしました');
    } catch (error) {
      console.warn('グローバルコマンドのクリアに失敗しました:', error);
    }
      // ギルド（サーバー）限定で登録（即時反映される）
    const guilds = client.guilds.cache;
    
    if (guilds.size > 0) {
      console.log(`${guilds.size}個のサーバーに参加中。サーバー固有のコマンドを登録します...`);
      
      // 最初のサーバーにのみコマンドを登録（コマンド重複を防ぐため）
      // Docker環境ではサーバーは基本的に1つのみを想定
      const firstGuild = guilds.first();
      const firstGuildId = firstGuild?.id;
      
      if (firstGuild && firstGuildId) {
        try {
          // まず既存のコマンドをクリア
          await rest.put(
            Routes.applicationGuildCommands(client.user!.id, firstGuildId),
            { body: [] }
          );
          console.log(`サーバー "${firstGuild.name}" の既存コマンドをクリアしました`);
          // 新しいコマンドを登録
        await rest.put(
          Routes.applicationGuildCommands(client.user!.id, firstGuildId),
          { body: commandsData }
        );
        console.log(`サーバー "${firstGuild.name}" にコマンドを登録完了`);
      } catch (error) {
        console.error(`サーバー "${firstGuild.name}" のコマンド登録中にエラーが発生しました:`, error);
        
        // エラーが発生した場合はグローバルコマンドとして登録
        console.log('サーバーコマンドの登録に失敗したため、グローバルコマンドとして登録します');
        await rest.put(
          Routes.applicationCommands(client.user!.id),
          { body: commandsData }
        );
      }
      }
    } else {
      console.warn('ボットがどのサーバーにも参加していません。グローバルコマンドとして登録します。');
      // グローバル登録をフォールバックとして使用
      await rest.put(
        Routes.applicationCommands(client.user!.id),
        { body: commandsData }
      );
    }
    
    console.log('✅ スラッシュコマンドが正常に登録されました');
  } catch (error) {
    console.error('スラッシュコマンドの登録に失敗しました:', error);
  }
}

// オートコンプリートのハンドリング
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = interaction.commandName;
    const focused = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand(false);
    
    if (command === 'trello-list-cards' && focused.name === 'list_id') {
      // リスト選択のオートコンプリート
      try {
        const lists = await getTrelloBoardLists();
        const choices = lists.map((list: TrelloList) => ({
          name: `${list.name}`,
          value: list.id
        }));
        
        console.log('trello-list-cards コマンドのオートコンプリートを提供:', choices.length);
        await interaction.respond(choices);
      } catch (error) {
        console.error('オートコンプリートエラー (lists):', error);
        await interaction.respond([]);
      }
    } else if (command === 'trello-board-select' && focused.name === 'board_id') {
      // ボード選択のオートコンプリート
      try {
        const { getAllBoards } = await import('./trello-boards');
        const boards = await getAllBoards();
        const choices = boards.map(board => ({
          name: board.name,
          value: board.id
        }));
        
        console.log('trello-board-select コマンドのオートコンプリートを提供:', choices.length);
        await interaction.respond(choices);
      } catch (error) {
        console.error('オートコンプリートエラー (boards):', error);
        await interaction.respond([]);
      }
    } else if (command === 'trello-card' && subcommand === 'view') {
      if (focused.name === 'list_id') {
        // リスト選択のオートコンプリート
        try {
          const lists = await getTrelloBoardLists();
          const choices = lists.map((list: TrelloList) => ({
            name: `${list.name}`,
            value: list.id
          }));
          
          console.log('オートコンプリートのリスト選択肢を提供:', choices.length);
          await interaction.respond(choices);
        } catch (error) {
          console.error('オートコンプリートエラー (lists):', error);
          await interaction.respond([]);
        }
      } else if (focused.name === 'card_id') {
        // カード選択のオートコンプリート
        try {
          const listId = interaction.options.getString('list_id');
          if (listId) {
            const cards = await getTrelloListCards(listId);
            const choices = cards.map((card: TrelloCard) => ({
              name: `${card.name}`,
              value: card.id
            }));
            
            console.log('オートコンプリートのカード選択肢を提供:', choices.length);
            await interaction.respond(choices);
          } else {
            console.log('list_idが選択されていないため、カードの選択肢を提供できません');
            await interaction.respond([]);
          }
        } catch (error) {
          console.error('オートコンプリートエラー (cards):', error);
          await interaction.respond([]);
        }
      }
    }
    return;
  }

  // スラッシュコマンドのハンドリング
  if (!interaction.isChatInputCommand()) return;
  
  try {
    const commandName = interaction.commandName;
    const handler = commandHandlers.get(commandName);
    
    if (!handler) {
      console.warn(`コマンド "${commandName}" のハンドラーが見つかりません`);
      await interaction.reply({
        content: 'このコマンドは現在利用できません',
        ephemeral: true
      });
      return;
    }
    
    await handler.execute(interaction);
  } catch (error) {
    console.error('コマンド実行中にエラーが発生しました:', error);
    
    // エラーメッセージを返信（すでに返信済みでないことを確認）
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('❌ コマンドの実行中にエラーが発生しました');
    } else {
      await interaction.reply({
        content: '❌ コマンドの実行中にエラーが発生しました',
        ephemeral: true
      });
    }
  }
});

// Trelloの通知をチェックする関数
async function checkTrelloNotifications(): Promise<void> {
  try {
    console.log('Trello通知をチェック中...');
    const notifications = await getRecentNotifications(10);
    
    if (notifications.length === 0) {
      console.log('新しい通知はありません');
      return;
    }
    
    // 最新の通知IDを取得
    const newestNotificationId = notifications[0].id;
    
    // 初回実行時または前回チェック時から新しい通知がある場合
    if (!lastNotificationId || lastNotificationId !== newestNotificationId) {
      const newNotifications: TrelloNotification[] = [];
      
      // 前回チェックした通知IDまで処理
      for (const notification of notifications) {
        if (notification.id === lastNotificationId) break;
          // 現在のアクティブなボードの通知のみフィルタリング
        const { getActiveBoardId } = await import('./trello-boards');
        const activeBoardId = getActiveBoardId();
        
        if (notification.data?.board?.id === activeBoardId) {
          newNotifications.push(notification);
        }
      }
      
      // 新しい通知があれば送信
      if (newNotifications.length > 0) {
        const channel = client.channels.cache.get(discordChannelId);
        if (channel && channel instanceof TextChannel) {
          console.log(`${newNotifications.length}件の新しい通知を送信します`);
          
          for (const notification of newNotifications.reverse()) {
            const message = formatTrelloNotificationRich(notification);
            await channel.send(message);
          }
        }
      } else {
        console.log('対象ボードの新しい通知はありません');
      }
      
      // 最後にチェックした通知IDを更新
      lastNotificationId = newestNotificationId;
    }
  } catch (error) {
    console.error('Trello通知の取得に失敗しました:', error);
  }
}

// Trello通知をリッチなDiscordメッセージに変換する関数
function formatTrelloNotificationRich(notification: TrelloNotification): MessageCreateOptions {
  const data = notification.data;
  const type = notification.type;
  const creator = notification.memberCreator;
  
  let title = '📢 Trello通知';
  let description = '';
  let color = 0x0079BF; // Trelloの青色
  
  // アクションに応じたカラーコード設定
  const COLOR_MAP: {[key: string]: number} = {
    commentCard: 0x61BD4F, // 緑
    createCard: 0x61BD4F, // 緑
    updateCard: 0xFFAB4A,  // オレンジ
    addedToCard: 0x0079BF, // 青
    removedFromCard: 0xEB5A46, // 赤
    deleteCard: 0xEB5A46  // 赤
  };
  
  // 通知タイプに基づいて内容を設定
  switch (type) {
    case 'commentCard':
      title = '💬 新しいコメント';
      description = `${data.text || ''}`;
      color = COLOR_MAP.commentCard;
      break;
      
    case 'addedToCard':
      title = '👤 メンバー追加';
      description = `${data.card?.name || '不明'}カードに${data.member?.fullName || '不明'}さんが追加されました`;
      color = COLOR_MAP.addedToCard;
      break;
      
    case 'createCard':
      title = '➕ カード作成';
      description = `「${data.card?.name || '不明'}」カードが作成されました`;
      if (data.list) {
        description += `\nリスト: ${data.list.name}`;
      }
      color = COLOR_MAP.createCard;
      break;
      
    case 'updateCard':
      if (data.listAfter && data.listBefore) {
        title = '📋 リスト移動';
        description = `「${data.card?.name || '不明'}」カードが「${data.listBefore.name}」から「${data.listAfter.name}」に移動されました`;
      } else if (data.card?.closed) {
        title = '🗑️ カードアーカイブ';
        description = `「${data.card.name}」カードがアーカイブされました`;
        color = COLOR_MAP.deleteCard;
      } else {
        title = '✏️ カード更新';
        description = `「${data.card?.name || '不明'}」カードが更新されました`;
      }
      color = COLOR_MAP.updateCard;
      break;
      
    default:
      title = `📢 ${type}`;
      description = `不明な通知タイプです`;
  }
  
  // リッチなEmbedを作成
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setAuthor({
      name: creator.fullName,
      iconURL: creator.avatarUrl || undefined
    })
    .setTimestamp(new Date(notification.date))
    .setFooter({ text: 'Trello', iconURL: 'https://trello.com/favicon.ico' });
  
  // カード情報があれば追加
  if (data.card) {
    // カードへのリンク
    const cardUrl = `https://trello.com/c/${data.card.id}`;
    embed.setURL(cardUrl);
    
    // フィールドに追加情報
    embed.addFields({ 
      name: 'カード', 
      value: `[${data.card.name}](${cardUrl})`,
      inline: true 
    });
  }
  
  // ボード情報があれば追加
  if (data.board) {
    const boardUrl = `https://trello.com/b/${data.board.id}`;
    embed.addFields({ 
      name: 'ボード', 
      value: `[${data.board.name}](${boardUrl})`,
      inline: true 
    });
  }
  
  return { embeds: [embed] };
}

// エラーハンドリングの強化
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Botにログイン
client.login(DISCORD_TOKEN).catch(error => {
  console.error('Botのログインに失敗しました:', error);
  process.exit(1);
});
