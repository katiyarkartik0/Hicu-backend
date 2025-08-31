import { INSTAGRAM_EVENTS } from "src/shared/constants/instagram/events.constants";

export const eventHelpers = {
    isValidCommentEvent: function (body: any): boolean {
      const entry = body.entry[0];
  
      const change = entry?.changes?.[0];
      const field = change?.field;
      const value = change?.value;
  
      return (
        field === INSTAGRAM_EVENTS.COMMENTS &&
        typeof value?.from?.id === 'string' &&
        typeof value?.from?.username === 'string'
      );
    },
    isValidDmEvent: function (body: any): boolean {
      const entry = body.entry[0];
      return entry.messaging?.[0]?.message;
    },
    isValidWebhookEvent: function (body): boolean {
      return body?.entry?.length;
    },
  };