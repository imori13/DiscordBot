/**
 * アプリケーション設定を一元管理するファイル
 */
import * as path from 'path';

// 環境変数の設定
export const ENV = {
  // Discord関連
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  GUILD_ID: process.env.GUILD_ID || '',
  
  // Trello関連
  TRELLO_API_KEY: process.env.TRELLO_API_KEY || '',
  TRELLO_TOKEN: process.env.TRELLO_TOKEN || '',
  TRELLO_BOARD_ID: process.env.TRELLO_BOARD_ID || '',
  
  // アプリケーション設定
  NODE_ENV: process.env.NODE_ENV || 'development',
  CONFIG_DIR: process.env.CONFIG_DIR || path.join(__dirname, '..', 'config'),
  LOGS_DIR: process.env.LOGS_DIR || path.join(__dirname, '..', 'logs'),
  
  // API設定
  TRELLO_API_BASE_URL: 'https://api.trello.com/1',
  
  // ポーリング設定
  POLL_INTERVAL: process.env.POLL_INTERVAL || '*/5 * * * *', // デフォルト: 5分ごと
  
  // ヘルスチェック設定
  HEALTH_CHECK_PORT: parseInt(process.env.HEALTH_CHECK_PORT || '8080', 10),
  
  // ログ設定
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// 設定ファイル
export const CONFIG_FILES = {
  BOARD_CONFIG: path.join(ENV.CONFIG_DIR, 'boardConfig.json')
};

// アプリケーション定数
export const APP = {
  // 通知タイプごとのカラー
  NOTIFICATION_COLORS: {
    commentCard: 0x61BD4F, // 緑
    createCard: 0x61BD4F, // 緑
    updateCard: 0xFFAB4A, // オレンジ
    addedToCard: 0x0079BF, // 青
    removedFromCard: 0xEB5A46, // 赤
    deleteCard: 0xEB5A46 // 赤
  },
  
  // Trello関連設定
  TRELLO: {
    MAX_BOARDS_HISTORY: 10,  // 最大ボード履歴数
    MAX_NOTIFICATIONS: 10    // 一度に取得する通知数
  }
};

// 環境変数のバリデーション
export function validateEnv(): boolean {
  const requiredVars = [
    'DISCORD_TOKEN',
    'DISCORD_CHANNEL_ID',
    'TRELLO_API_KEY',
    'TRELLO_TOKEN'
  ];
  
  const missingVars = requiredVars.filter(name => !ENV[name as keyof typeof ENV]);
  
  if (missingVars.length > 0) {
    console.error(`必須環境変数が設定されていません: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}