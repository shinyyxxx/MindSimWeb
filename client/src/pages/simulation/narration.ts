export type NarrationOptions = {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
    onStart?: () => void;
};
let activeAudio: HTMLAudioElement | null = null;
let activeReject: ((reason?: unknown) => void) | null = null;

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

export function cancelNarration(): void {
    clearActiveAudio();
    if (activeReject) {
        const reject = activeReject;
        activeReject = null;
        reject(new Error('cancelled'));
    }
}

export async function speakNarration(text: string, options: NarrationOptions = {}): Promise<void> {
    const clean = text.trim();
    if (!clean) return;

    cancelNarration();

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
            input: { text: clean },
            voice,
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: options.rate ?? 0.95,
                pitch: options.pitch ?? 0,
                volumeGainDb: Math.round(((options.volume ?? 1) - 1) * 6),
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`Google TTS request failed: ${res.status}`);
    }

    const data = await res.json() as { audioContent?: string };
    if (!data.audioContent) {
        throw new Error('Google TTS response missing audioContent');
    }

    const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
    audio.preload = 'auto';
    audio.setAttribute('playsinline', 'true');
    activeAudio = audio;

    await new Promise<void>((resolve, reject) => {
        activeReject = reject;

        const onEnded = () => {
            cleanup();
            resolve();
        };
        const onError = () => {
            cleanup();
            reject(new Error('Audio playback failed'));
        };
        const cleanup = () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            if (activeAudio === audio) activeAudio = null;
            if (activeReject === reject) activeReject = null;
        };

        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        options.onStart?.();
        audio.play().catch(onError);
    });
}
