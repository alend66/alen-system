// GTA Interactive Sound Effects using HTML5 Web Audio API
class GtaAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private radioOscillators: OscillatorNode[] = [];
  private radioGain: GainNode | null = null;
  private isRadioPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isRadioPlaying) {
      this.stopRadio();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // GTA Menu Click sound
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(340, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed before user interaction
    }
  }

  // GTA Menu Hover sound
  public playHover() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext not allowed before user interaction
    }
  }

  // Wanted Star increase / Police alert chime
  public playStarSound(stars: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const baseFreq = 300 + stars * 120;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext not allowed
    }
  }

  // Mission Passed Jingle
  public playMissionSuccess() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + index * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // AudioContext not allowed
    }
  }

  // Toggle GTA 98.4 FM Ambient Synthwave Station
  public toggleRadio(): boolean {
    if (this.isRadioPlaying) {
      this.stopRadio();
      return false;
    } else {
      this.startRadio();
      return true;
    }
  }

  public getRadioPlaying(): boolean {
    return this.isRadioPlaying;
  }

  private startRadio() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.radioGain = this.ctx.createGain();
      this.radioGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      this.radioGain.connect(this.ctx.destination);

      // 80s Vice City Lush Minor Chord progression (A minor9: A, C, E, G, B)
      const freqs = [110, 220, 261.63, 329.63, 392.00, 493.88];
      this.radioOscillators = freqs.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        
        // Add subtle detune for vintage analog chorus warmth
        osc.detune.setValueAtTime((i - 2) * 5, this.ctx!.currentTime);
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + (i * 120), this.ctx!.currentTime);

        osc.connect(filter);
        filter.connect(this.radioGain!);
        osc.start();
        return osc;
      });

      this.isRadioPlaying = true;
    } catch {
      this.isRadioPlaying = false;
    }
  }

  public stopRadio() {
    this.radioOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.radioOscillators = [];
    if (this.radioGain) {
      try {
        this.radioGain.disconnect();
      } catch {
        // ignore
      }
      this.radioGain = null;
    }
    this.isRadioPlaying = false;
  }
}

export const gtaAudio = new GtaAudioEngine();
