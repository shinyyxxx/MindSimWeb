export type NarrationOptions = {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

let activeResolve: (() => void) | null = null

export function cancelNarration(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Ignore speech cancellation errors in unsupported runtimes.
  }
  if (activeResolve) {
    const resolve = activeResolve
    activeResolve = null
    resolve()
  }
}

export function speakNarration(text: string, options: NarrationOptions = {}): Promise<void> {
  const clean = text.trim()
  if (!clean) return Promise.resolve()
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return Promise.resolve()
  }

  cancelNarration()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = options.rate ?? 1.12
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1
    utterance.lang = options.lang ?? 'en-US'

    let done = false
    const maxDurationMs = Math.max(2600, Math.min(30000, clean.length * 180))
    const timeout = window.setTimeout(() => {
      finish()
      try {
        window.speechSynthesis.cancel()
      } catch {
        // Ignore; timeout fallback still resolves caller.
      }
    }, maxDurationMs)

    const finish = () => {
      if (done) return
      done = true
      window.clearTimeout(timeout)
      if (activeResolve === resolve) activeResolve = null
      resolve()
    }

    activeResolve = resolve
    utterance.onend = finish
    utterance.onerror = finish

    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      finish()
    }
  })
}

