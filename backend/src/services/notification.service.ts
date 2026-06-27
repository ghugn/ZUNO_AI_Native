import prisma from '../lib/prisma.js';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  actionHref?: string;
}

export async function createNotification(payload: NotificationPayload) {
  return await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      actionHref: payload.actionHref,
    },
  });
}

export async function getNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50, // limit to 50 recent notifications
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Creates a notification if a similar one hasn't been created recently (e.g. today).
 * Used for dynamic suggestions to prevent spam.
 */
export async function createSuggestionNotificationIfUnique(
  userId: string,
  title: string,
  body: string,
  actionHref?: string
) {
  // Check if there is already an unread suggestion with the same title today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'suggestion',
      title,
      createdAt: { gte: today },
    },
  });

  if (existing) return existing;

  return await createNotification({
    userId,
    type: 'suggestion',
    title,
    body,
    actionHref,
  });
}
