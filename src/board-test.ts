/**
 * Trelloボード検出と選択機能テスト用スクリプト
 */
import { getAllBoards, getActiveBoardId, setActiveBoardId, initializeBoardId } from './trello-boards';

async function main() {
  try {
    console.log('====== Trelloボード機能テスト ======');
    
    // 1. 現在のアクティブなボードID確認
    const currentBoardId = getActiveBoardId();
    console.log(`現在のアクティブなボードID: ${currentBoardId || 'なし'}`);
    
    // 2. 利用可能なボード一覧取得
    console.log('\n利用可能なボード一覧を取得中...');
    const boards = await getAllBoards();
    console.log(`${boards.length}個のボードが見つかりました:`);
    
    boards.forEach((board, index) => {
      console.log(`[${index + 1}] ${board.name} (ID: ${board.id})`);
    });
    
    if (boards.length > 0) {
      // 3. 別のボードを選択してみる（最後のボードを選択）
      const lastBoard = boards[boards.length - 1];
      console.log(`\n最後のボードを選択: ${lastBoard.name}`);
      setActiveBoardId(lastBoard.id, lastBoard.name);
      
      // 4. 選択後のアクティブなボードID確認
      const newBoardId = getActiveBoardId();
      console.log(`選択後のアクティブなボードID: ${newBoardId}`);
      
      // 5. 自動初期化をテスト
      console.log('\nボードの自動初期化をテスト中...');
      const initBoardId = await initializeBoardId();
      console.log(`初期化されたボードID: ${initBoardId}`);
    }
    
    console.log('\nテスト完了');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  }
}

// スクリプト実行
main();
