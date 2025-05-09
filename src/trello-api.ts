// Trello API連携用のファイル
import axios from 'axios';
import dotenv from 'dotenv';
import { 
  TrelloBoard, 
  TrelloList, 
  TrelloCard, 
  TrelloActionResponse, 
  TrelloMember 
} from './types';

// 環境変数の読み込み
dotenv.config();

// ボード管理モジュールをインポート
import { getActiveBoardId } from './trello-boards';

// Trello APIの設定
const trelloApiKey = process.env.TRELLO_API_KEY || '';
const trelloToken = process.env.TRELLO_TOKEN || '';

// 環境変数のバリデーション
if (!trelloApiKey || !trelloToken) {
  console.error('環境変数が正しく設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// アクティブなボードIDを取得する関数
function getTrelloBoardId(): string {
  const boardId = getActiveBoardId();
  if (!boardId) {
    console.error('有効なボードIDがありません。環境変数または設定ファイルを確認してください。');
    // エラーをスローせず、空文字列を返す
    // 呼び出し側でハンドリングが必要
  }
  return boardId;
}

// APIの基本URL
const TRELLO_API_BASE_URL = 'https://api.trello.com/1';

// 認証情報を付加したURLを生成する関数
function getAuthenticatedUrl(endpoint: string): string {
  return `${TRELLO_API_BASE_URL}${endpoint}?key=${trelloApiKey}&token=${trelloToken}`;
}

// 監視中のボード情報を取得
export async function getTrelloBoard(): Promise<TrelloBoard> {
  try {
    const boardId = getTrelloBoardId();
    if (!boardId) {
      throw new Error('有効なボードIDがありません');
    }
    
    const response = await axios.get(
      getAuthenticatedUrl(`/boards/${boardId}`),
      {
        params: {
          fields: 'name,url,desc,labels,members',
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('ボード情報取得エラー:', error);
    throw new Error('ボード情報の取得に失敗しました');
  }
}

// ボード内のリスト一覧を取得
export async function getTrelloBoardLists(): Promise<TrelloList[]> {  try {
    const boardId = getTrelloBoardId();
    if (!boardId) {
      throw new Error('有効なボードIDがありません');
    }
    
    const response = await axios.get(
      getAuthenticatedUrl(`/boards/${boardId}/lists`),
      {
        params: {
          fields: 'name,closed',
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('リスト情報取得エラー:', error);
    throw new Error('リスト情報の取得に失敗しました');
  }
}

// カードを作成する
export async function createTrelloCard(
  idList: string, 
  name: string, 
  desc: string = ''
): Promise<TrelloCard> {
  try {
    const response = await axios.post(
      getAuthenticatedUrl('/cards'),
      {
        idList,
        name,
        desc,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('カード作成エラー:', error);
    throw new Error('カードの作成に失敗しました');
  }
}

// カード情報を取得
export async function getTrelloCard(cardId: string): Promise<TrelloCard> {
  try {
    const [cardResponse, listResponse, commentsResponse] = await Promise.all([
      // カード基本情報
      axios.get(getAuthenticatedUrl(`/cards/${cardId}`)),
      
      // カードが属するリスト情報
      axios.get(getAuthenticatedUrl(`/cards/${cardId}/list`)),
      
      // コメント数を取得
      axios.get(getAuthenticatedUrl(`/cards/${cardId}/actions`), {
        params: { filter: 'commentCard' }
      })
    ]);
    
    // カード情報にリスト名とコメント数を追加
    return {
      ...cardResponse.data,
      listName: listResponse.data.name,
      commentCount: commentsResponse.data.length,
    };
  } catch (error) {
    console.error('カード情報取得エラー:', error);
    throw new Error('カード情報の取得に失敗しました');
  }
}

// リスト内のカード一覧を取得
export async function getTrelloListCards(listId: string): Promise<TrelloCard[]> {
  try {
    const response = await axios.get(
      getAuthenticatedUrl(`/lists/${listId}/cards`),
      {
        params: {
          fields: 'name,due,labels,members',
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('リスト内カード取得エラー:', error);
    throw new Error('リスト内のカード取得に失敗しました');
  }
}

// カードにコメントを追加
export async function addCommentToCard(
  cardId: string, 
  text: string
): Promise<TrelloActionResponse> {
  try {
    const response = await axios.post(
      getAuthenticatedUrl(`/cards/${cardId}/actions/comments`),
      { text }
    );
    
    return response.data;
  } catch (error) {
    console.error('コメント追加エラー:', error);
    throw new Error('コメントの追加に失敗しました');
  }
}

// カードを別のリストに移動
export async function moveCardToList(cardId: string, listId: string): Promise<TrelloCard> {
  try {
    const response = await axios.put(
      getAuthenticatedUrl(`/cards/${cardId}`),
      { idList: listId }
    );
    
    return response.data;
  } catch (error) {
    console.error('カード移動エラー:', error);
    throw new Error('カードの移動に失敗しました');
  }
}

// カードにメンバーを追加
export async function addMemberToCard(
  cardId: string, 
  memberId: string
): Promise<{id: string}> {
  try {
    const response = await axios.post(
      getAuthenticatedUrl(`/cards/${cardId}/idMembers`),
      { value: memberId }
    );
    
    return response.data;
  } catch (error) {
    console.error('メンバー追加エラー:', error);
    throw new Error('メンバーの追加に失敗しました');
  }
}

// ボードのメンバー一覧取得
export async function getBoardMembers(): Promise<TrelloMember[]> {
  try {
    const boardId = getTrelloBoardId();
    if (!boardId) {
      throw new Error('有効なボードIDがありません');
    }
    
    const response = await axios.get(
      getAuthenticatedUrl(`/boards/${boardId}/members`)
    );
    
    return response.data;
  } catch (error) {
    console.error('ボードメンバー取得エラー:', error);
    throw new Error('ボードメンバーの取得に失敗しました');
  }
}

// 新しい通知のチェック
export async function getRecentNotifications(limit: number = 10) {
  try {
    const response = await axios.get<any[]>(
      getAuthenticatedUrl('/members/me/notifications'),
      {
        params: {
          limit,
          filter: 'all',
          read_filter: 'unread',
          memberCreator: true,
          memberCreator_fields: 'fullName,username',
          board: true,
          board_fields: 'name',
          card: true,
          card_fields: 'name',
          list: true,
          organization: false
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('通知取得エラー:', error);
    throw new Error('通知の取得に失敗しました');
  }
}
