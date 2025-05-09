// Trello通知の型定義
export interface TrelloMember {
  id?: string;
  fullName: string;
  username?: string;
  avatarHash?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface TrelloLabel {
  id: string;
  name?: string;
  color?: string;
}

export interface TrelloCard {
  name: string;
  id: string;
  closed?: boolean;
  desc?: string;
  due?: string;
  url?: string;
  members?: TrelloMember[];
  labels?: TrelloLabel[];
  // 拡張プロパティ
  listName?: string;
  commentCount?: number;
}

export interface TrelloList {
  name: string;
  id: string;
  closed?: boolean;
  pos?: number;
}

export interface TrelloBoard {
  id: string;
  name: string;
  desc?: string;
  url?: string;
  closed?: boolean;
  labels?: TrelloLabel[];
  members?: TrelloMember[];
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
  unread?: boolean;
  [key: string]: any;
}

// Trello APIのレスポンス型
export interface TrelloActionResponse {
  id: string;
  type: string;
  data: {
    text: string;
    [key: string]: any;
  };
  date: string;
  memberCreator: TrelloMember;
}

// Discord関連の型定義
export interface DiscordUserMapping {
  discordId: string;
  trelloMemberId: string;
  username: string;
}
