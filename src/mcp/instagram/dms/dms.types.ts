export type SanitizedDmPayload = {
  dm: {
    senderId: string;
    recipientId: string;
    messageId: string;
    messageText: string;
    timestamp: string;
  };
};
