import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';

const expo = new Expo();

/**
 * Send a push notification to an array of Expo Push Tokens
 */
export const sendPushNotification = async (
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  const messages: ExpoPushMessage[] = [];

  for (const pushToken of pushTokens) {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    });
  }

  // The Expo push notification service accepts batches of notifications
  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log('Push tickets created:', ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notifications chunk:', error);
    }
  }

  // Extract receipt IDs
  const receiptIds: string[] = [];
  for (const ticket of tickets) {
    if (ticket.status === 'ok') {
      receiptIds.push(ticket.id);
    } else if (ticket.status === 'error') {
      console.error(`There was an error creating a notification ticket:`, ticket);
    }
  }

  // Receipts could be checked later if needed
};
