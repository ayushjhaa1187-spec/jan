import { z } from 'zod';

export const publishQuerySchema = z.object({
  force: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return false;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    }),
});
