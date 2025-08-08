export interface InstagramConfig {
  accessToken: string;
  apiVersion: string;
}

export type InstagramMessage = {
  id: string;
  created_time: string;
  from: {
    username: string;
    id: string;
  };
  message: string;
};

export type InstagramConversation = {
  messages: {
    data: InstagramMessage[];
    paging?: {
      cursors?: {
        after?: string;
      };
      next?: string;
    };
  };
  id: string;
};

type CommentInput = {
  action: any;
  conversationHistory: any;
  trigger: string;
  commentText: string;
  dmText?: never; // explicitly disallow dmText
};

type DMInput = {
  action: any;
  conversationHistory: any;
  trigger: string;
  commentText?: never; // explicitly disallow commentText
  dmText: string;
};

type GetPromptInput = CommentInput | DMInput;

export type MediaItem = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  thumbnail: string;
};

export type UserProfile = {
  id: string;
  name: string;
  username: string;
  biography: string;
  profilePictureUrl: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  accountType: string;
  media: {
    data: MediaItem[];
  };
};
