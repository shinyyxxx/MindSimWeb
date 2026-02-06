export type DhammaObjectProps = {
  id: string
  title: string
  description: string
  highlights: string[]
  modelLabel: string
  modelPath: string
}

export class DhammaObject {
  id: string
  title: string
  description: string
  highlights: string[]
  modelLabel: string
  modelPath: string

  constructor({ id, title, description, highlights, modelLabel, modelPath }: DhammaObjectProps) {
    this.id = id
    this.title = title
    this.description = description
    this.highlights = highlights
    this.modelLabel = modelLabel
    this.modelPath = modelPath
  }

  getPreview(): string {
    return `${this.title} — ${this.modelLabel}`
  }

  speakDescription(
    opts: { text?: string; lang?: string; rate?: number; pitch?: number } = {},
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available in this environment.')
      return
    }

    const { text = this.description, lang = 'th-TH', rate = 1.2, pitch = 1 } = opts
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.pitch = pitch

    // Cancel any in-flight utterance to avoid overlap, then speak.
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }
}

