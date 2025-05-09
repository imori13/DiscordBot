/**
 * Trelloボード初期化スクリプト
 * このスクリプトは起動時に実行され、利用可能なボードを取得・初期化します
 */
import dotenv from 'dotenv';
import { initializeBoardId, getAllBoards } from './trello-boards';

// 環境変数の読み込み
dotenv.config();

// メイン関数
async function main() {
  try {
    console.log('Trelloボード初期化を開始します...');
    
    // ボードIDの初期化
    const boardId = await initializeBoardId();
    
    if (boardId) {
      console.log(`アクティブなボードID: ${boardId}`);
      
      // 利用可能なすべてのボードを表示
      console.log('利用可能なすべてのボード:');
      const boards = await getAllBoards();
      boards.forEach(board => {
        console.log(`- ${board.name} (${board.id})`);
      });
      
      console.log('初期化が完了しました。');
    } else {
      console.error('ボードIDの初期化に失敗しました。');
      process.exit(1);
    }
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトを実行
main();
