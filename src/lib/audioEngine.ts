import { SoundType } from '../types';

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  // Play procedural sound effects based on DSP acoustic models
  public play(type: SoundType, options: { pitch?: number; gain?: number } = {}) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const gainScale = options.gain ?? 1;

    switch (type) {
      case 'click': {
        // High transient click (snappy notch, slider tick, typing)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const freq = options.pitch ?? 2400;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.035);

        gain.gain.setValueAtTime(0.4 * gainScale, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }

      case 'pop': {
        // Rounded organic pop (callouts, chips, badges)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = options.pitch ?? 850;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.35, t + 0.08);

        gain.gain.setValueAtTime(0.5 * gainScale, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }

      case 'blip': {
        // Melodic accent blip (synthesizer tone, step note)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = options.pitch ?? 440;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35 * gainScale, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.32);
        break;
      }

      case 'whoosh': {
        // Filtered white-noise frequency sweep for transitions & reveals
        const bufferSize = this.ctx.sampleRate * 0.45;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1.8, t);
        filter.frequency.setValueAtTime(300, t);
        filter.frequency.exponentialRampToValueAtTime(3200, t + 0.2);
        filter.frequency.exponentialRampToValueAtTime(600, t + 0.45);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.55 * gainScale, t + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        whiteNoise.start(t);
        whiteNoise.stop(t + 0.46);
        break;
      }

      case 'chime': {
        // Lush additive harmonic chime chord
        const base = options.pitch ?? 587.33; // D5
        const ratios = [1, 1.498, 2, 2.519]; // Root, 5th, 8ve, 10th
        ratios.forEach((ratio, idx) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(base * ratio, t);

          const decay = 1.2 + idx * 0.2;
          const amp = (0.22 / (idx + 1)) * gainScale;
          gain.gain.setValueAtTime(amp, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + decay + 0.05);
        });
        break;
      }

      case 'impact': {
        // Deep sub-bass cinematic impact thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.5);

        gain.gain.setValueAtTime(0.85 * gainScale, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

        // Add a burst of low-passed noise
        const bufLen = Math.floor(this.ctx.sampleRate * 0.25);
        const noiseBuf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, t);
        filter.frequency.exponentialRampToValueAtTime(60, t + 0.25);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6 * gainScale, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        noiseSrc.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.75);
        noiseSrc.start(t);
        noiseSrc.stop(t + 0.26);
        break;
      }

      case 'riser': {
        // Exponential tension pitch sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.9);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(4500, t + 0.9);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0.4 * gainScale, t + 0.85);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.96);
        break;
      }
    }
  }
}

export const audioEngine = new ProceduralAudioEngine();
