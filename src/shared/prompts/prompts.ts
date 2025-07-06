import { INSTAGRAM_EVENTS } from "../constants/instagram/events.constants";

const { COMMENTS, DM_RECEIVED } = INSTAGRAM_EVENTS;

export const registeredActions = {
  extractLeads: function ({
    eventType = COMMENTS,
    conversationHistory = [],
    trigger,
    latestConversation,
    extractInformation = [],
    additionalInformation,
  }: {
    eventType: typeof COMMENTS | typeof DM_RECEIVED;
    conversationHistory?: string[];
    latestConversation: string;
    trigger: any;
    extractInformation?: string[];
    additionalInformation?: string;
  }) {
    const isStartOfConversation = conversationHistory.length === 0;

    const basePrompt = (context: string) => `
      You are a helpful AI assistant in a conversation with a user.

      Goal:
      - ${context} the conversation naturally to collect more information from the user.
      - You are trying to gather the following missing user information: ${extractInformation.join(', ')}.
      - Ask open-ended or friendly follow-up questions to elicit this information.
      - Keep the tone casual and engaging, just be straight forward yet respectful. Don't try to be personal.
      - Do NOT summarize or output structured data — just keep the chat going.
      - Do NOT repeat the question if you have the answer already.

      IMPORTANT:
      - Additionally, ${additionalInformation}
      - If the user refuses or denies to answer in any way, OR if you have successfully collected all the required information (${extractInformation.join(', ')}),
        then try to gracefully end the conversation.
    `;

    const additionalContext = `
      - User just commented: ${latestConversation}
      - The trigger that sparked the conversation was: ${trigger}
    `;

    const historyContext = `
      - Previous conversation: ${JSON.stringify(conversationHistory, null, 2)}
    `;

    if (eventType === COMMENTS && isStartOfConversation) {
      return (
        basePrompt('Start') +
        additionalContext +
        `\n\nNext Message:`
      ).trim();
    }

    if (eventType === COMMENTS && !isStartOfConversation) {
      return (
        basePrompt('Continue') +
        historyContext +
        additionalContext +
        `\n\nNext Message:`
      ).trim();
    }

    if (eventType === DM_RECEIVED && isStartOfConversation) {
      return (
        basePrompt('Start') +
        additionalContext +
        `\n\nNext Message:`
      ).trim();
    }

    if (eventType === DM_RECEIVED && !isStartOfConversation) {
      return (
        basePrompt('Continue') +
        historyContext +
        additionalContext +
        `\n\nNext Message:`
      ).trim();
    }

    throw new Error('Unidentified event cannot generate prompt');
  },
};
