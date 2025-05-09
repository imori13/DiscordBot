// Trello通知の型定義
export interface TrelloMember {
  fullName: string;
  username?: string;
}

export interface TrelloCard {
  name: string;
  id: string;
  closed?: boolean;
}

export interface TrelloList {
  name: string;
  id: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
}

export interface TrelloNotificationData {
  board?: TrelloBoard;
  card?: TrelloCard;
  list?: TrelloList;
  listBefore?: TrelloList;
  listAfter?: TrelloList;
  member?: TrelloMember;
  text?: string;
  [key: string]: any;
}

export interface TrelloNotification {
  id: string;
  type: string;
  memberCreator: TrelloMember;
  data: TrelloNotificationData;
  date: string;
  [key: string]: any;
}
