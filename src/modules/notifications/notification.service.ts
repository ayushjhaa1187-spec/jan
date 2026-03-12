import prisma from '../../utils/prisma';

export const getUsersWithPermission = async (permission: string): Promise<string[]> => {
  const normalized = permission.toLowerCase();
  const [action, ...resourceParts] = normalized.split('_');
  const resource = resourceParts.join('_').toUpperCase();

  const users = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: {
            permissions: {
              some: {
                permission: {
                  action: action.toUpperCase(),
                  resource,
                },
              },
            },
          },
        },
      },
    },
    select: { id: true },
  });

  return users.map((user) => user.id);
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: 'SYSTEM',
      },
    });
  } catch {
    // swallow notification failures to avoid interrupting main flows
  }
};

export const notificationService = {
  async listNotifications(userId: string, query: { read?: 'true' | 'false'; page: number; limit: number }) {
    const where = {
      userId,
      ...(query.read ? { isRead: query.read === 'true' } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [total, unread, data] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: {
          id: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: data.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        read: item.isRead,
        createdAt: item.createdAt,
      })),
      meta: {
        total,
        unread,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getUnreadCount(userId: string) {
    const unread = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unread };
  },

  async markAsRead(userId: string, id: string) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async deleteNotification(userId: string, id: string) {
    await prisma.notification.deleteMany({
      where: { id, userId },
    });
  },

  async clearAll(userId: string) {
    await prisma.notification.deleteMany({
      where: { userId },
    });
  },
};
