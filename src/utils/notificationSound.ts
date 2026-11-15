let sharedAudioCtx: AudioContext | null = null;

export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 880, start: now, duration: 0.1 },
      { freq: 1174.66, start: now + 0.09, duration: 0.16 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.start);

      gain.gain.setValueAtTime(0.0001, note.start);
      gain.gain.exponentialRampToValueAtTime(0.06, note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(note.start);
      osc.stop(note.start + note.duration + 0.01);
    }
  } catch {
    // Safely ignore autoplay or audio restrictions in browser environments
  }
}
