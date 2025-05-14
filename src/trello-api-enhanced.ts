/**
 * Trello API連携の拡張機能
 * より高度なTrello API操作と拡張機能を提供
 */
import axios from 'axios';
import { ENV, APP } from './config';
import { 
  TrelloBoard, 
  TrelloList, 
  TrelloCard, 
  TrelloMember, 
  TrelloLabel,
  TrelloNotification
} from './types';
import { getActiveBoardId } from './trello-boards';

/**
 * 認証情報を付加したURLを生成する関数
 */
function getAuthenticatedUrl(endpoint: string): string {
  return `${ENV.TRELLO_API_BASE_URL}${endpoint}?key=${ENV.TRELLO_API_KEY}&token=${ENV.TRELLO_TOKEN}`;
}

/**
 * カード詳細情報を取得（コメント数、チェックリスト、添付ファイル情報含む）
 */
export async function getCardDetails(cardId: string): Promise<TrelloCard> {
  try {
    const response = await axios.get(
      getAuthenticatedUrl(`/cards/${cardId}`),
      {
        params: {
          fields: 'name,desc,due,closed,labels,members,url',
          actions: 'commentCard',
          attachments: 'true',
          checklists: 'all',
          checkItemStates: 'true'
        }
      }
    );
    
    const card = response.data;
    
    // コメント数を追加
    if (card.actions) {
      card.commentCount = card.actions.length;
    }
    
    return card;
  } catch (error) {
    console.error('カード詳細取得エラー:', error);
    throw new Error('カード詳細の取得に失敗しました');
  }
}

/**
 * カードにコメントを追加
 */
export async function addCommentToCard(cardId: string, comment: string): Promise<void> {
  try {
    await axios.post(
      getAuthenticatedUrl(`/cards/${cardId}/actions/comments`),
      { text: comment }
    );
  } catch (error) {
    console.error('コメント追加エラー:', error);
    throw new Error('コメントの追加に失敗しました');
  }
}

/**
 * カードにメンバーを追加
 */
export async function addMemberToCard(cardId: string, memberId: string): Promise<void> {
  try {
    await axios.post(
      getAuthenticatedUrl(`/cards/${cardId}/idMembers`),
      { value: memberId }
    );
  } catch (error) {
    console.error('メンバー追加エラー:', error);
    throw new Error('メンバーの追加に失敗しました');
  }
}

/**
 * カードからメンバーを削除
 */
export async function removeMemberFromCard(cardId: string, memberId: string): Promise<void> {
  try {
    await axios.delete(
      getAuthenticatedUrl(`/cards/${cardId}/idMembers/${memberId}`)
    );
  } catch (error) {
    console.error('メンバー削除エラー:', error);
    throw new Error('メンバーの削除に失敗しました');
  }
}

/**
 * カードにラベルを追加
 */
export async function addLabelToCard(cardId: string, labelId: string): Promise<void> {
  try {
    await axios.post(
      getAuthenticatedUrl(`/cards/${cardId}/idLabels`),
      { value: labelId }
    );
  } catch (error) {
    console.error('ラベル追加エラー:', error);
    throw new Error('ラベルの追加に失敗しました');
  }
}

/**
 * カードの期限を設定
 */
export async function setCardDueDate(cardId: string, dueDate: Date): Promise<void> {
  try {
    await axios.put(
      getAuthenticatedUrl(`/cards/${cardId}`),
      { due: dueDate.toISOString() }
    );
  } catch (error) {
    console.error('期限設定エラー:', error);
    throw new Error('期限の設定に失敗しました');
  }
}

/**
 * ボードの統計情報を取得
 */
export async function getBoardStatistics(): Promise<{
  cardCount: number;
  listsBreakdown: { [listName: string]: number };
  memberActivity: { [memberName: string]: number };
}> {
  try {
    const boardId = getActiveBoardId();
    if (!boardId) {
      throw new Error('有効なボードIDがありません');
    }
    
    // リスト一覧を取得
    const listsResponse = await axios.get(
      getAuthenticatedUrl(`/boards/${boardId}/lists`),
      {
        params: {
          cards: 'open',
          card_fields: 'name,idMembers'
        }
      }
    );
    
    // メンバー一覧を取得
    const membersResponse = await axios.get(
      getAuthenticatedUrl(`/boards/${boardId}/members`)
    );
    
    const lists = listsResponse.data;
    const members = membersResponse.data;
    
    // メンバーIDから名前へのマッピング
    const memberMap: { [key: string]: string } = {};
    members.forEach((member: TrelloMember) => {
      if (member.id) {
        memberMap[member.id] = member.fullName;
      }
    });
    
    // 統計情報の計算
    let cardCount = 0;
    const listsBreakdown: { [listName: string]: number } = {};
    const memberActivity: { [memberName: string]: number } = {};
    
    lists.forEach((list: any) => {
      const listCards = list.cards || [];
      listsBreakdown[list.name] = listCards.length;
      cardCount += listCards.length;
      
      // メンバーごとのカード数
      listCards.forEach((card: any) => {
        (card.idMembers || []).forEach((memberId: string) => {
          const memberName = memberMap[memberId] || memberId;
          memberActivity[memberName] = (memberActivity[memberName] || 0) + 1;
        });
      });
    });
    
    return {
      cardCount,
      listsBreakdown,
      memberActivity
    };
  } catch (error) {
    console.error('ボード統計取得エラー:', error);
    throw new Error('ボード統計情報の取得に失敗しました');
  }
}