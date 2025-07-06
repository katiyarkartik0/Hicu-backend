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
