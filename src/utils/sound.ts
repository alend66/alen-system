// Web Audio API tactile audio engine
// Pure synthesized audio - zero external audio files required

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved audio preference
    const saved = localStorage.getItem('alen_sys_muted');
    this.isMuted = saved === 'true';
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('alen_sys_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.playBeep(880, 0.08, 'sine', 0.05);
    }
    return this.isMuted;
  }

  public setMuted(val: boolean) {
    this.isMuted = val;
    localStorage.setItem('alen_sys_muted', String(this.isMuted));
  }

  // Play simple synth tone
  public playTone(freq: number, duration: number = 0.05, type: OscillatorType = 'sine', gainVal: number = 0.04) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failure
    }
  }

  // Subtle keyclick
  public playKeypress() {
    // Random frequency around 1200Hz - 1600Hz for organic mechanical feel
    const freq = 1200 + Math.random() * 400;
    this.playTone(freq, 0.025, 'triangle', 0.015);
  }

  // Terminal command execute sound
  public playExecute() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      this.playTone(520, 0.04, 'sine', 0.04);
      setTimeout(() => this.playTone(880, 0.06, 'sine', 0.04), 40);
    } catch {
      // Ignore
    }
  }

  // Success / Verified chirp
  public playSuccess() {
    this.playTone(600, 0.05, 'sine', 0.03);
    setTimeout(() => this.playTone(900, 0.08, 'sine', 0.04), 60);
    setTimeout(() => this.playTone(1200, 0.12, 'sine', 0.05), 130);
  }

  // Error buzz
  public playError() {
    this.playTone(180, 0.12, 'sawtooth', 0.04);
    setTimeout(() => this.playTone(140, 0.15, 'sawtooth', 0.04), 100);
  }

  // Diagnostic scan tick
  public playScanTick(progress: number) {
    const freq = 400 + progress * 8;
    this.playTone(freq, 0.03, 'sine', 0.03);
  }

  // Beep helper
  public playBeep(freq: number = 800, dur: number = 0.05, type: OscillatorType = 'sine', gain: number = 0.04) {
    this.playTone(freq, dur, type, gain);
  }
}

export const sound = new SoundEngine();
