import { z } from 'zod';

const radioStationSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  url: z.string().url(),
  playback: z.enum(['audio', 'external']).default('audio'),
});

export const radioProviderResponseSchema = z.object({
  radios: z.array(radioStationSchema),
});

export const radioListResponseSchema = z.object({
  stations: z.array(radioStationSchema),
});

export type RadioStation = z.infer<typeof radioStationSchema>;
