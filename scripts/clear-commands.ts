// Discordのスラッシュコマンドをリセットするためのスクリプト
// 使い方: ts-node clear-commands.ts

import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';

// 環境変数の読み込み
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
const CLIENT_ID = process.env.CLIENT_ID || ''; // ボットのクライアントID

async function clearCommands() {
  if (!DISCORD_TOKEN) {
    console.error('環境変数が設定されていません。.envファイルを確認してください。');
    process.exit(1);
  }

  if (!CLIENT_ID) {
    console.error('CLIENT_IDが設定されていません。.envファイルに追加してください。');
    console.log('CLIENT_IDはDiscord Developer Portalで確認できます。');
    process.exit(1);
  }
  try {
    console.log('Discordスラッシュコマンドをクリアしています...');
    
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    
    // グローバルコマンドをクリア
    console.log('グローバルコマンドをクリア中...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [] }
    );
    console.log('✅ グローバルコマンドをクリアしました');
    
    // 特定のギルド（サーバー）のコマンドもクリアする場合
    // 環境変数からギルドIDを取得
    const GUILD_ID = process.env.GUILD_ID;
    
    if (GUILD_ID) {
      console.log(`サーバー(${GUILD_ID})のコマンドをクリア中...`);
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: [] }
      );
      console.log(`✅ サーバー(${GUILD_ID})のコマンドをクリアしました`);
    }

    console.log('全てのコマンドをクリアしました。ボットを再起動して新しいコマンドを登録してください。');
  } catch (error) {
    console.error('コマンドのクリア中にエラーが発生しました:', error);
  }
}

clearCommands();
