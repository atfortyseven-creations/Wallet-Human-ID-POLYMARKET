import { z } from 'zod';

export const AlertRuleSchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9\s-_]+$/, "Name contains invalid characters"),
  enabled: z.boolean().optional(),
  conditions: z.array(z.object({
    field: z.enum(['price', 'volume', 'balance', 'movement']),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    value: z.number().or(z.string()),
    threshold: z.number().optional()
  })).min(1).max(5),
  actions: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    webhook: z.string().url().optional().or(z.literal(''))
  }).optional()
});

export type AlertRuleInput = z.infer<typeof AlertRuleSchema>;

