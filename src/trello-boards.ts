/**
 * Trelloボード関連のユーティリティ
 * ユーザーのボード一覧取得、選択などの機能を提供
 */
import axios from 'axios';
import { TrelloBoard } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Trello API設定
const trelloApiKey = process.env.TRELLO_API_KEY || '';
const trelloToken = process.env.TRELLO_TOKEN || '';

// 設定ファイル名（Docker環境でも動作するよう調整）
const CONFIG_DIR = process.env.CONFIG_DIR || path.join(__dirname, '..');
const CONFIG_FILE = path.join(CONFIG_DIR, 'boardConfig.json');

// ボード設定の型
export interface BoardConfig {
  activeBoardId: string;
  recentBoards: {
    id: string;
    name: string;
    lastUsed: string; // ISO日付文字列
  }[];
}

// デフォルト設定
const defaultConfig: BoardConfig = {
  activeBoardId: '',
  recentBoards: []
};

/**
 * 現在のボード設定を読み込む
 */
export function loadBoardConfig(): BoardConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('ボード設定ファイルの読み込みエラー:', error);
  }
  return { ...defaultConfig };
}

/**
 * ボード設定を保存
 */
export function saveBoardConfig(config: BoardConfig): void {
  try {
    // 設定ディレクトリがない場合は作成
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`設定ディレクトリを作成しました: ${configDir}`);
    }
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log(`ボード設定を保存しました: ${CONFIG_FILE}`);
  } catch (error) {
    console.error('ボード設定ファイルの保存エラー:', error);
  }
}

/**
 * アクティブなボードIDを取得
 */
export function getActiveBoardId(): string {
  // 1. 環境変数を最優先
  if (process.env.TRELLO_BOARD_ID) {
    return process.env.TRELLO_BOARD_ID;
  }
  
  // 2. 設定ファイルから取得
  const config = loadBoardConfig();
  if (config.activeBoardId) {
    return config.activeBoardId;
  }
  
  // 3. 最近使用したボードがあればその最初のもの
  if (config.recentBoards.length > 0) {
    return config.recentBoards[0].id;
  }
  
  // 該当なし
  return '';
}

/**
 * アクティブなボードIDを設定
 */
export function setActiveBoardId(boardId: string, boardName?: string): void {
  const config = loadBoardConfig();
  
  // アクティブボード更新
  config.activeBoardId = boardId;
  
  // 最近使用したボード一覧も更新
  const existingIndex = config.recentBoards.findIndex(b => b.id === boardId);
  if (existingIndex >= 0) {
    // 既存のエントリを更新
    config.recentBoards[existingIndex].lastUsed = new Date().toISOString();
    
    // 名前が提供されていれば更新
    if (boardName) {
      config.recentBoards[existingIndex].name = boardName;
    }
    
    // 先頭に移動
    const board = config.recentBoards.splice(existingIndex, 1)[0];
    config.recentBoards.unshift(board);
  } else if (boardName) {
    // 新規エントリ追加
    config.recentBoards.unshift({
      id: boardId,
      name: boardName,
      lastUsed: new Date().toISOString()
    });
    
    // 最大10件に制限
    if (config.recentBoards.length > 10) {
      config.recentBoards.pop();
    }
  }
  
  // 設定を保存
  saveBoardConfig(config);
}

/**
 * ユーザーがアクセスできるすべてのボードを取得
 */
export async function getAllBoards(): Promise<TrelloBoard[]> {
  try {
    const response = await axios.get(
      `https://api.trello.com/1/members/me/boards`,
      {
        params: {
          key: trelloApiKey,
          token: trelloToken,
          fields: 'name,url,desc,closed'
        }
      }
    );
    
    return response.data.filter((board: any) => !board.closed);
  } catch (error) {
    console.error('ボード一覧取得エラー:', error);
    throw new Error('ボード情報の取得に失敗しました');
  }
}

/**
 * ボードが有効かどうかを検証
 */
export async function validateBoardId(boardId: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `https://api.trello.com/1/boards/${boardId}`,
      {
        params: {
          key: trelloApiKey,
          token: trelloToken,
          fields: 'name'
        }
      }
    );
    
    return !!response.data.id;
  } catch (error) {
    return false;
  }
}

/**
 * 起動時にボードIDを初期化
 * 環境変数、設定ファイル、API取得の優先順で処理
 */
export async function initializeBoardId(): Promise<string> {
  // 1. 環境変数チェック
  if (process.env.TRELLO_BOARD_ID) {
    const boardId = process.env.TRELLO_BOARD_ID;
    try {
      // 環境変数のIDを検証
      const isValid = await validateBoardId(boardId);
      if (isValid) {
        console.log(`環境変数のボードIDを使用: ${boardId}`);
        return boardId;
      } else {
        console.warn(`環境変数のボードID "${boardId}" は無効です`);
      }
    } catch (error) {
      console.error('ボードID検証エラー:', error);
    }
  }
  
  // 2. 設定ファイルチェック
  const config = loadBoardConfig();
  if (config.activeBoardId) {
    try {
      const isValid = await validateBoardId(config.activeBoardId);
      if (isValid) {
        console.log(`設定ファイルのボードIDを使用: ${config.activeBoardId}`);
        return config.activeBoardId;
      } else {
        console.warn(`設定ファイルのボードID "${config.activeBoardId}" は無効です`);
      }
    } catch (error) {
      console.error('ボードID検証エラー:', error);
    }
  }
  
  // 3. APIでボード一覧取得
  try {
    const boards = await getAllBoards();
    if (boards.length > 0) {
      const firstBoard = boards[0];
      console.log(`利用可能なボードを自動選択: ${firstBoard.name} (${firstBoard.id})`);
      
      // 最初のボードをアクティブに設定
      setActiveBoardId(firstBoard.id, firstBoard.name);
      return firstBoard.id;
    }
  } catch (error) {
    console.error('ボード自動選択エラー:', error);
  }
  
  // いずれも失敗した場合
  console.error('有効なボードIDが見つかりません');
  return '';
}
