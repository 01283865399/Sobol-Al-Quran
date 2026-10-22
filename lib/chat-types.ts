import { z } from 'zod';

export const chatSourceSchema = z.object({
  kind: z.enum(['quran', 'hadith', 'website']),
  title: z.string(),
  reference: z.string(),
  url: z.string(),
  excerpt: z.string().optional(),
  grades: z
    .array(
      z.object({
        grade: z.string(),
        gradedBy: z.string(),
      })
    )
    .optional(),
});

export const chatApiResponseSchema = z.object({
  answer: z.string().min(1),
  answerType: z.enum(['generated', 'notice']).default('generated'),
  sources: z.array(chatSourceSchema).default([]),
});

export const chatStreamEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('delta'), text: z.string().min(1) }),
  z.object({ type: z.literal('done') }),
  z.object({
    type: z.literal('error'),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  }),
]);

export const chatApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ChatSource = z.infer<typeof chatSourceSchema>;
export type ChatApiResponse = z.infer<typeof chatApiResponseSchema>;
