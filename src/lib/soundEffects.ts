/**
 * Notification Sound Effects using Web Audio API
 * Provides synthesized chimes for classroom real-time events without external MP3 files.
 */

const STORAGE_KEY = 'cctv_teacher_sound_muted';
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
        try {
            sharedAudioContext = new AudioContextClass();
        } catch {
            return null;
        }
    }

    if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {
            // Browser autoplay policy might restrict until user interaction
        });
    }

    return sharedAudioContext;
}

/**
 * Check if notification sound is enabled in teacher preferences
 */
export function isNotificationSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    try {
        return localStorage.getItem(STORAGE_KEY) !== 'true';
    } catch {
        return true;
    }
}

/**
 * Toggle or set notification sound preference
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, enabled ? 'false' : 'true');
        window.dispatchEvent(new CustomEvent('cctv_sound_setting_changed', { detail: { enabled } }));
    } catch {
        // ignore
    }
}

let lastChimeTime = 0;

export type ChimeTone = 'new_submission' | 'approval_success' | 'alert';

/**
 * Plays a pleasant notification chime using synthesized audio nodes
 */
export function playNotificationChime(tone: ChimeTone = 'new_submission'): void {
    if (!isNotificationSoundEnabled()) return;

    // Prevent double-chimes if multiple realtime listeners fire simultaneously (throttle 600ms)
    const currentTimeMs = Date.now();
    if (currentTimeMs - lastChimeTime < 600) {
        return;
    }
    lastChimeTime = currentTimeMs;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // If context is still suspended, try resuming once
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        if (tone === 'new_submission') {
            // Dual-tone Ding-Dong Chime: D5 (587Hz) followed by A5 (880Hz)
            playTone(ctx, 587.33, now, 0.28, 0.16, 'sine');
            playTone(ctx, 880.00, now + 0.12, 0.55, 0.22, 'sine');
            // Subtle harmonic shimmer
            playTone(ctx, 1760.00, now + 0.12, 0.35, 0.04, 'triangle');
        } else if (tone === 'approval_success') {
            // Ascending triad confirmation: C5 -> E5 -> G5
            playTone(ctx, 523.25, now, 0.18, 0.14, 'sine');
            playTone(ctx, 659.25, now + 0.09, 0.20, 0.16, 'sine');
            playTone(ctx, 783.99, now + 0.18, 0.45, 0.20, 'sine');
        } else {
            // Notice alert: E5 (659Hz) single gentle ding
            playTone(ctx, 659.25, now, 0.35, 0.18, 'sine');
        }
    } catch {
        // Fallback silently if audio fails
    }
}

function playTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'sine'
) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    // Smooth envelope attack and exponential decay to prevent clicks/pops
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    osc.onended = () => {
        try {
            osc.disconnect();
            gain.disconnect();
        } catch {
            // ignore
        }
    };
}
