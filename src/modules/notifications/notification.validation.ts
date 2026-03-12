import { z } from 'zod';

export const listNotificationsSchema = z.object({
  read: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
