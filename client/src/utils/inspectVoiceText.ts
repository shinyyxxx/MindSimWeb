export function detailTextForVoiceNarration(detail: string | undefined | null): string {
  if (detail == null || !String(detail).trim()) return ''
  let s = String(detail).trim()

  // Canonical backend join: description + " — Thai: … · Pāli: …"
  s = s.replace(/\s[—–]\s*Thai:\s*[\s\S]*$/i, '')
  s = s.replace(/\s-\s*Thai:\s*[\s\S]*$/i, '')

  // Trailing or standalone script labels
  s = s.replace(/\s*·\s*Pā?li:\s*[^\n]*/gi, '')
  s = s.replace(/\bPā?li:\s*[^\n]*/gi, '')
  s = s.replace(/\bThai:\s*[^\n]*/gi, '')

  s = s.replace(/\s+[—–-]\s*$/u, '').trim()
  s = s.replace(/\s{2,}/g, ' ')
  return s.trim()
}
