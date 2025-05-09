// スラッシュコマンド定義用ファイル
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
// APIのインポート
import { 
  getTrelloBoard, 
  getTrelloBoardLists, 
  createTrelloCard, 
  getTrelloCard, 
  getTrelloListCards 
} from './trello-api';

// コマンドハンドラーの型定義
interface CommandHandler {
  data: {
    toJSON(): any;
  }; // SlashCommandBuilderとその派生型を許容
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// ヘルプコマンド
export const helpCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-help')
    .setDescription('Trello Bot のヘルプを表示します'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('Trello Bot ヘルプ')
      .setColor('#0079BF')
      .setDescription('このBotはTrelloボードとDiscordを連携します')
      .addFields(
        { name: '/trello-board', value: 'Trelloボードの概要を表示します', inline: true },
        { name: '/trello-lists', value: 'ボード内のリスト一覧を表示します', inline: true },
        { name: '/trello-card create', value: 'カードを作成します', inline: true },
        { name: '/trello-card view', value: 'カードの詳細を表示します', inline: true },
      )
      .setFooter({ text: 'Trello Discord Bot', iconURL: 'https://trello.com/favicon.ico' });
      
    await interaction.reply({ embeds: [embed] });
  }
};

// ボード情報表示コマンド
export const boardCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-board')
    .setDescription('Trelloボードの概要を表示します'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    try {
      const board = await getTrelloBoard();
      
      const embed = new EmbedBuilder()
        .setTitle(board.name)
        .setColor('#0079BF')
        .setDescription(board.desc || 'ボードの説明なし')
        .addFields(
          { name: 'URL', value: board.url || 'リンクなし' },
          { name: 'ID', value: board.id, inline: true },
          { name: 'ラベル数', value: `${board.labels?.length || 0}`, inline: true },
          { name: 'メンバー数', value: `${board.members?.length || 0}`, inline: true }
        )
        .setFooter({ text: 'Trello Board', iconURL: 'https://trello.com/favicon.ico' })
        .setTimestamp();
        
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('ボード情報取得エラー:', error);
      await interaction.editReply('❌ ボード情報の取得に失敗しました');
    }
  }
};

// リスト一覧表示コマンド
export const listsCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-lists')
    .setDescription('ボード内のリスト一覧を表示します'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    try {
      const lists = await getTrelloBoardLists();
        const embed = new EmbedBuilder()
        .setTitle('Trello リスト一覧')
        .setColor('#0079BF')
        .setDescription(`${lists.length}件のリストがあります`)
        .setFooter({ text: 'Trello Lists', iconURL: 'https://trello.com/favicon.ico' })
        .setTimestamp();
      
      // リスト情報を追加
      for (const list of lists) {
        embed.addFields({
          name: list.name,
          value: `ID: ${list.id.substring(0, 8)}... (${list.closed ? '閉じています' : '開いています'})`,
          inline: false
        });
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('リスト情報取得エラー:', error);
      await interaction.editReply('❌ リスト情報の取得に失敗しました');
    }
  }
};

// カード作成コマンド
export const cardCreateCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-card')
    .setDescription('Trelloカード操作')
    .addSubcommand(subcommand => 
      subcommand
        .setName('create')
        .setDescription('新しいカードを作成します')
        .addStringOption(option => 
          option
            .setName('list_id')
            .setDescription('カードを追加するリストのID')
            .setRequired(true))
        .addStringOption(option => 
          option
            .setName('name')
            .setDescription('カード名')
            .setRequired(true))
        .addStringOption(option => 
          option
            .setName('description')
            .setDescription('カードの説明')
            .setRequired(false)))    .addSubcommand(subcommand => 
      subcommand
        .setName('view')
        .setDescription('カードの詳細を表示します')
        .addStringOption(option => 
          option
            .setName('list_id')
            .setDescription('リストID (選択肢から選べます)')
            .setRequired(true)
            .setAutocomplete(true))
        .addStringOption(option => 
          option
            .setName('card_id')
            .setDescription('カードID (選択肢から選べます)')
            .setRequired(true)
            .setAutocomplete(true))),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'create') {
      await handleCardCreate(interaction);
    } else if (subcommand === 'view') {
      await handleCardView(interaction);
    }
  }
};

// カード作成処理
async function handleCardCreate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  
  const listId = interaction.options.getString('list_id') as string;
  const name = interaction.options.getString('name') as string;
  const description = interaction.options.getString('description') || '';
  
  try {
    const card = await createTrelloCard(listId, name, description);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ カード作成完了')
      .setColor('#70B500')
      .setDescription(`「${card.name}」を作成しました`)
      .addFields(
        { name: 'カードID', value: card.id, inline: true },
        { name: '説明', value: card.desc || '(なし)', inline: false },
        { name: 'URL', value: card.url || 'リンクなし', inline: false }
      )
      .setFooter({ text: 'Trello Card Created', iconURL: 'https://trello.com/favicon.ico' })
      .setTimestamp();
      
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('カード作成エラー:', error);
    await interaction.editReply('❌ カードの作成に失敗しました');
  }
}

// カード詳細表示処理
async function handleCardView(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  
  const listId = interaction.options.getString('list_id') as string;
  const cardId = interaction.options.getString('card_id') as string;
  
  try {
    const card = await getTrelloCard(cardId);
    
    const embed = new EmbedBuilder()
      .setTitle(card.name)
      .setColor('#0079BF')
      .setDescription(card.desc || '(説明なし)')
      .addFields(
        { name: 'リスト', value: card.listName || '不明', inline: true },
        { name: 'メンバー数', value: `${card.members?.length || 0}名`, inline: true },
        { name: 'コメント数', value: `${card.commentCount || 0}件`, inline: true }
      );
    
    if (card.due) {
      embed.addFields({ 
        name: '期限日', 
        value: new Date(card.due).toLocaleString('ja-JP'), 
        inline: true 
      });
    }
    
    if (card.labels && card.labels.length > 0) {
      const labelText = card.labels.map((label: {name?: string, color?: string}) => 
        `${label.name || '(ラベル名なし)'} (${label.color || 'なし'})`
      ).join('\n');
      
      embed.addFields({ name: 'ラベル', value: labelText, inline: false });
    }
    
    if (card.url) {
      embed.setURL(card.url);
    }
    
    embed
      .setFooter({ text: 'Trello Card', iconURL: 'https://trello.com/favicon.ico' })
      .setTimestamp();
      
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('カード情報取得エラー:', error);
    await interaction.editReply('❌ カード情報の取得に失敗しました');
  }
}

// リスト内のカード一覧表示コマンド
export const listCardsCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-list-cards')
    .setDescription('リスト内のカード一覧を表示します')
    .addStringOption(option => 
      option
        .setName('list_id')
        .setDescription('リストID')
        .setRequired(true)),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const listId = interaction.options.getString('list_id') as string;
    
    try {
      const cards = await getTrelloListCards(listId);
      
      const embed = new EmbedBuilder()
        .setTitle('リスト内のカード一覧')
        .setColor('#0079BF')
        .setDescription(`${cards.length}件のカードがあります`)
        .setFooter({ text: 'Trello List Cards', iconURL: 'https://trello.com/favicon.ico' })
        .setTimestamp();
      
      // カード情報を追加（最大25件まで）
      const displayCards = cards.slice(0, 25);      for (const card of displayCards) {
        embed.addFields({
          name: card.name,
          value: `ID: ${card.id.substring(0, 8)}... ${card.due ? `\n期限: ${new Date(card.due).toLocaleDateString('ja-JP')}` : ''}`,
          inline: false
        });
      }
      
      if (cards.length > 25) {
        embed.addFields({
          name: '注意',
          value: `表示できるのは25件までです。残り${cards.length - 25}件は省略されました。`,
          inline: false
        });
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('カード一覧取得エラー:', error);
      await interaction.editReply('❌ カード一覧の取得に失敗しました');
    }
  }
};

// 全てのコマンドをまとめたもの
export const commands = [
  helpCommand,
  boardCommand,
  listsCommand,
  cardCreateCommand,
  listCardsCommand,
];

// コマンドIDとハンドラーの対応マップ
export const commandHandlers = new Map<string, CommandHandler>([
  ['trello-help', helpCommand],
  ['trello-board', boardCommand],
  ['trello-lists', listsCommand],
  ['trello-card', cardCreateCommand],
  ['trello-list-cards', listCardsCommand],
]);
