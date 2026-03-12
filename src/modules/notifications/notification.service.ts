import prisma from '../../utils/prisma';

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
    // never throw, notifications must not block main flow
  }
};

export const getUsersWithPermission = async (permission: string): Promise<string[]> => {
  const normalized = permission.toLowerCase();

  const userRoles = await prisma.userRole.findMany({
    include: {
      user: true,
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const userIds = userRoles
    .filter((row) =>
      row.role.permissions.some(
        (rp) => `${rp.permission.action}_${rp.permission.resource}`.toLowerCase() === normalized,
      ),
    )
    .map((row) => row.userId);

  return Array.from(new Set(userIds));
};

export const notificationService = {
  async listMyNotifications(userId: string, query: { read?: 'true' | 'false'; page: number; limit: number }) {
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

  async unreadCount(userId: string) {
    const unread = await prisma.notification.count({ where: { userId, isRead: false } });
    return { unread };
  },

  async markRead(userId: string, id: string) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markReadAll(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async deleteOne(userId: string, id: string) {
    await prisma.notification.deleteMany({ where: { id, userId } });
  },

  async clearAll(userId: string) {
    await prisma.notification.deleteMany({ where: { userId } });
  },
};
