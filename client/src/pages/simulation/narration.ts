export type NarrationOptions = {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
};
let activeResolve: (() => void) | null = null;
let activeAudio: HTMLAudioElement | null = null;
function clearActiveAudio(): void {
    if (!activeAudio)
        return;
    try {
        activeAudio.pause();
        activeAudio.src = '';
    }
    catch {
    }
    activeAudio = null;
}
function getGoogleVoiceForLang(lang: string): {
    languageCode: string;
    name: string;
} {
    const normalized = (lang || 'en-US').toLowerCase();
    if (normalized.startsWith('th')) {
        return { languageCode: 'th-TH', name: 'th-TH-Standard-A' };
    }
    return { languageCode: 'en-US', name: 'en-US-Standard-C' };
}
async function speakWithGoogleTts(text: string, options: NarrationOptions): Promise<void> {
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY;
    if (!apiKey) {
        throw new Error('VITE_GOOGLE_TTS_KEY is not configured');
    }
    const lang = options.lang ?? 'en-US';
    const voice = getGoogleVoiceForLang(lang);
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            input: { text },
            voice,
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: options.rate ?? 1.12,
                pitch: options.pitch ?? 0,
                volumeGainDb: Math.round(((options.volume ?? 1) - 1) * 6),
            },
        }),
    });
    if (!res.ok) {
        throw new Error(`Google TTS request failed: ${res.status}`);
    }
    const data = await res.json() as {
        audioContent?: string;
    };
    if (!data.audioContent) {
        throw new Error('Google TTS response missing audioContent');
    }
    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    activeAudio = audio;
    await audio.play();
    await new Promise<void>((resolve, reject) => {
        const onEnded = () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            if (activeAudio === audio)
                activeAudio = null;
            resolve();
        };
        const onError = () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            if (activeAudio === audio)
                activeAudio = null;
            reject(new Error('Audio playback failed'));
        };
        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });
    });
}
export function cancelNarration(): void {
    clearActiveAudio();
    if (typeof window === 'undefined' || !('speechSynthesis' in window))
        return;
    try {
        window.speechSynthesis.cancel();
    }
    catch {
    }
    if (activeResolve) {
        // #region agent log
        fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:cancelNarration',message:'cancelNarration resolving activeResolve',data:{},timestamp:Date.now(),hypothesisId:'H2,H3'})}).catch(()=>{});
        // #endregion
        const resolve = activeResolve;
        activeResolve = null;
        resolve();
    }
}
export function speakNarration(text: string, options: NarrationOptions = {}): Promise<void> {
    const clean = text.trim();
    if (!clean)
        return Promise.resolve();
    cancelNarration();
    return new Promise((resolve) => {
        const run = async () => {
            const hasSpeechSynthesis = typeof window !== 'undefined'
                && 'speechSynthesis' in window
                && 'SpeechSynthesisUtterance' in window;
            const hasGoogleKey = Boolean(import.meta.env.VITE_GOOGLE_TTS_KEY);
            // #region agent log
            fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:speakNarration',message:'speakNarration entered',data:{textLen:clean.length,hasGoogleKey,hasSpeechSynthesis,lang:options.lang,rate:options.rate},timestamp:Date.now(),hypothesisId:'H1,H4'})}).catch(()=>{});
            // #endregion
            if (hasGoogleKey) {
                try {
                    // #region agent log
                    fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:googleTts-start',message:'Calling Google TTS',data:{textLen:clean.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
                    // #endregion
                    await speakWithGoogleTts(clean, options);
                    // #region agent log
                    fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:googleTts-done',message:'Google TTS playback finished',data:{textLen:clean.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
                    // #endregion
                    resolve();
                    return;
                }
                catch (err) {
                    // #region agent log
                    fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:googleTts-fail',message:'Google TTS failed',data:{error:String(err)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
                    // #endregion
                    console.error('Google TTS failed, falling back to browser speech', err);
                }
            }
            if (!hasSpeechSynthesis) {
                // #region agent log
                fetch('http://127.0.0.1:7348/ingest/be8de27e-6f32-40ba-ab50-dc91fcfe8c8b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'683fe8'},body:JSON.stringify({sessionId:'683fe8',location:'narration.ts:no-speech-synthesis',message:'No speech synthesis available, resolving immediately',data:{},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
                // #endregion
                resolve();
                return;
            }
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.rate = options.rate ?? 1.12;
            utterance.pitch = options.pitch ?? 1;
            utterance.volume = options.volume ?? 1;
            utterance.lang = options.lang ?? 'en-US';
            let done = false;
            const maxDurationMs = Math.max(2600, Math.min(30000, clean.length * 180));
            const timeout = window.setTimeout(() => {
                finish();
                try {
                    window.speechSynthesis.cancel();
                }
                catch {
                }
            }, maxDurationMs);
            const finish = () => {
                if (done)
                    return;
                done = true;
                window.clearTimeout(timeout);
                if (activeResolve === resolve)
                    activeResolve = null;
                resolve();
            };
            activeResolve = resolve;
            utterance.onend = finish;
            utterance.onerror = finish;
            try {
                window.speechSynthesis.speak(utterance);
            }
            catch {
                finish();
            }
        };
        void run();
    });
}
