// ボード選択コマンド

import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getAllBoards, setActiveBoardId } from '../trello-boards';
import { TrelloBoard } from '../types';

// コマンドハンドラーの型定義
export interface CommandHandler {
  data: {
    toJSON(): any;
  };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

// ボード選択コマンド
export const boardSelectCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('trello-board-select')
    .setDescription('使用するTrelloボードを選択します')
    .addStringOption(option => 
      option
        .setName('board_id')
        .setDescription('選択するボードのID (未指定時は一覧表示)')
        .setRequired(false)
        .setAutocomplete(true)),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    try {
      // ボード一覧を取得
      const boards = await getAllBoards();
      
      // 選択されたボードID (なければ一覧表示のみ)
      const selectedBoardId = interaction.options.getString('board_id');
      
      // リッチな埋め込みメッセージを作成
      const embed = new EmbedBuilder()
        .setColor('#0079BF')
        .setFooter({ text: 'Trello Board Select', iconURL: 'https://trello.com/favicon.ico' })
        .setTimestamp();
      
      if (selectedBoardId) {
        // ボード選択処理
        const selectedBoard = boards.find(board => board.id === selectedBoardId);
        if (selectedBoard) {
          // ボードを選択
          setActiveBoardId(selectedBoard.id, selectedBoard.name);
          
          embed
            .setTitle('✅ ボード選択完了')
            .setDescription(`「${selectedBoard.name}」を選択しました`)
            .addFields(
              { name: 'ボードID', value: selectedBoard.id, inline: true },
              { name: 'URL', value: selectedBoard.url || '(URLなし)', inline: true }
            );
          
          if (selectedBoard.desc) {
            embed.addFields({ name: '説明', value: selectedBoard.desc });
          }
        } else {
          embed
            .setTitle('❌ ボード選択エラー')
            .setDescription('指定されたIDのボードが見つかりませんでした')
            .setColor('#FF0000');
        }
      } else {
        // ボード一覧表示
        embed
          .setTitle('Trelloボード一覧')
          .setDescription(`アクセス可能なボード: ${boards.length}件`);
        
        // 各ボードの情報を追加
        boards.forEach(board => {
          embed.addFields({
            name: board.name,
            value: `ID: \`${board.id}\`\n${board.url ? `[ボードを開く](${board.url})` : ''}`,
            inline: false
          });
        });
        
        embed.addFields({
          name: '使用方法',
          value: '`/trello-board-select board_id:選択したいボードID` でボードを選択できます。'
        });
      }
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('ボード選択エラー:', error);
      await interaction.editReply('❌ ボード情報の取得または選択に失敗しました');
    }
  }
};

// エクスポート
export default boardSelectCommand;
