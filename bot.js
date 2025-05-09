require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const TrelloEvents = require('trello-events');
const schedule = require('node-schedule');
const axios = require('axios');

// Discordクライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Trello APIの設定
const trelloApiKey = process.env.TRELLO_API_KEY;
const trelloToken = process.env.TRELLO_TOKEN;
const trelloBoardId = process.env.TRELLO_BOARD_ID;
const discordChannelId = process.env.DISCORD_CHANNEL_ID;

// 最後にチェックした通知のID
let lastNotificationId = '';

// Discord Botの起動時処理
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // 1時間ごとにTrelloの通知をチェック
  schedule.scheduleJob('0 * * * *', checkTrelloNotifications);
  // 起動時にも一度チェック
  checkTrelloNotifications();
});

// Trelloの通知をチェックする関数
async function checkTrelloNotifications() {
  try {
    const response = await axios.get(
      `https://api.trello.com/1/members/me/notifications?key=${trelloApiKey}&token=${trelloToken}`
    );
    
    const notifications = response.data;
    if (notifications.length === 0) return;
    
    // 最新の通知IDを取得
    const newestNotificationId = notifications[0].id;
    
    // 初回実行時または前回チェック時から新しい通知がある場合
    if (!lastNotificationId || lastNotificationId !== newestNotificationId) {
      const newNotifications = [];
      
      // 前回チェックした通知IDまで処理
      for (const notification of notifications) {
        if (notification.id === lastNotificationId) break;
        
        // 指定したボードの通知のみフィルタリング
        if (notification.data && notification.data.board && notification.data.board.id === trelloBoardId) {
          newNotifications.push(notification);
        }
      }
      
      // 新しい通知があれば送信
      if (newNotifications.length > 0) {
        const channel = client.channels.cache.get(discordChannelId);
        if (channel) {
          for (const notification of newNotifications.reverse()) {
            const message = formatTrelloNotification(notification);
            await channel.send(message);
          }
        }
      }
      
      // 最後にチェックした通知IDを更新
      lastNotificationId = newestNotificationId;
    }
  } catch (error) {
    console.error('Trello通知の取得に失敗しました:', error);
  }
}

// Trello通知をDiscordメッセージ形式に変換する関数
function formatTrelloNotification(notification) {
  let message = '';
  const data = notification.data;
  const type = notification.type;
  
  switch (type) {
    case 'commentCard':
      message = `💬 **新しいコメント**: ${notification.memberCreator.fullName}さんが「${data.card.name}」カードにコメントしました: ${data.text}`;
      break;
    case 'addedToCard':
      message = `👤 **メンバー追加**: ${data.card.name}カードに${notification.memberCreator.fullName}さんが${data.member.fullName}さんを追加しました`;
      break;
    case 'createCard':
      message = `➕ **カード作成**: ${notification.memberCreator.fullName}さんが「${data.card.name}」カードを作成しました`;
      break;
    case 'updateCard':
      if (data.listAfter && data.listBefore) {
        message = `📋 **リスト移動**: ${notification.memberCreator.fullName}さんが「${data.card.name}」カードを「${data.listBefore.name}」から「${data.listAfter.name}」に移動しました`;
      } else if (data.card.closed) {
        message = `🗑️ **カード削除**: ${notification.memberCreator.fullName}さんが「${data.card.name}」カードをアーカイブしました`;
      } else {
        message = `✏️ **カード更新**: ${notification.memberCreator.fullName}さんが「${data.card.name}」カードを更新しました`;
      }
      break;
    default:
      message = `📢 **Trello通知**: ${notification.memberCreator.fullName}さんによるアクション`;
  }
  
  return message;
}

// Botにログイン
client.login(process.env.DISCORD_TOKEN);