export async function playTextToSpeech(text: string): Promise<void> {
  const trimmed = text.trim()
  if (!trimmed) return

  const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY as string | undefined
  if (apiKey) {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: trimmed },
          voice: { languageCode: 'en-US', name: 'en-US-Standard-C' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      },
    )
    if (!res.ok) {
      throw new Error(`TTS request failed: ${res.status}`)
    }
    const data = (await res.json()) as { audioContent?: string }
    if (!data.audioContent) {
      throw new Error('No audioContent in TTS response')
    }
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Audio playback failed'))
      void audio.play().catch(reject)
    })
    return
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return new Promise((resolve, reject) => {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(trimmed)
      u.lang = 'en-US'
      u.onend = () => resolve()
      u.onerror = () => reject(new Error('Speech synthesis failed'))
      window.speechSynthesis.speak(u)
    })
  }

  throw new Error('No TTS available (set VITE_GOOGLE_TTS_KEY or use a browser with Speech Synthesis)')
}
