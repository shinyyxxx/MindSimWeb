import sadSingleTearEmojiModel from '../assets/emoji/sadSingleTear_emoji.glb?url'

export type FeelingMoodVisual = {
  modelPath: string
  modelTargetWorldSize?: number
  modelOffset?: { x?: number; y?: number; z?: number }
}

const FEELING_MENTAL_MOOD_VISUALS: Record<string, FeelingMoodVisual> = {
  bad: {
    modelPath: sadSingleTearEmojiModel,
    modelTargetWorldSize: 6.506,
    modelOffset: { x: 0, y: -0.65, z: 0 },
  },
}

export function normalizeFeelingMood(mood: string): string {
  return mood.trim().toLowerCase()
}

export function getFeelingMoodVisual(mood: string): FeelingMoodVisual | null {
  const normalized = normalizeFeelingMood(mood)
  return FEELING_MENTAL_MOOD_VISUALS[normalized] ?? null
}
