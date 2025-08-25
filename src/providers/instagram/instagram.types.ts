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

export type IgUserProfile = {
  igUserId: string;
  igName: string;
  igUsername: string;
  igBiography: string;
  igProfilePictureUrl: string;
  igFollowersCount: number;
  igFollowingCount: number;
  igMediaCount: number;
  igAccountType: string;
};

export type SanitizedCommentPayload = {
  comment: {
    commentId: string;
    commenterUsername: string;
    commenterId: string;
    commentText: string;
    mediaOwnerId: string;
    mediaId: string;
    parentCommentId: string | null;
    isReply: boolean;
    timestamp: string;
  };
  media: {
    mediaOwnerId: string;
    mediaId: string;
  };
};

export type IgCommentDto = {
  accountId: number;
  id: string;
  text: string;
  username: string;
  userId: string;
  mediaOwnerId: string;
  mediaId: string;
  parentCommentId: string | null;
  isReply: boolean;
  timestamp: string;
  createdAt: string;
};
