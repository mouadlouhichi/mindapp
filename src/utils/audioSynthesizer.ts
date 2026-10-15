import { SoundscapeType } from '../types/meditation';

class SoundscapeSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSoundscape: SoundscapeType = 'none';
  private isPlaying: boolean = false;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private intervalIds: number[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    this.isPlaying = false;
    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.intervalIds = [];

    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
    this.currentSoundscape = 'none';
  }

  public play(type: SoundscapeType, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying && this.currentSoundscape === type) {
      return;
    }

    this.stop();
    if (type === 'none') return;

    this.isPlaying = true;
    this.currentSoundscape = type;
    this.setVolume(volume);

    switch (type) {
      case 'tibetan_bowls':
        this.startTibetanBowls();
        break;
      case 'ocean_waves':
        this.startOceanWaves();
        break;
      case 'forest_rain':
        this.startForestRain();
        break;
      case 'binaural_theta':
        this.startThetaBinaural();
        break;
      case 'zen_windchimes':
        this.startZenWindchimes();
        break;
    }
  }

  // 1. Tibetan Singing Bowls with harmonic resonance and periodic strikes
  private startTibetanBowls() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    // Base drone
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(108, ctx.currentTime); // Sacred 108Hz harmonic
    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    droneOsc.connect(droneGain);
    droneGain.connect(master);
    droneOsc.start();
    this.activeNodes.push(droneOsc, droneGain);

    const playBowlStrike = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      // Frequencies corresponding to singing bowl harmonics (Root ~ 216Hz, 432Hz, 648Hz)
      const baseFreq = [192, 216, 288, 324, 432][Math.floor(Math.random() * 5)];
      const harmonics = [baseFreq, baseFreq * 2.01, baseFreq * 3.02, baseFreq * 4.76];

      harmonics.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Slow natural strike and long ring-out
        const initialVol = (0.2 / (idx + 1)) * (0.8 + Math.random() * 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(initialVol, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 9.0 + Math.random() * 3.0);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 12);
        this.activeNodes.push(osc, gain);
      });
    };

    // First strike immediately
    playBowlStrike();
    // Subsequent strikes every 7-11 seconds
    const interval = window.setInterval(() => {
      playBowlStrike();
    }, 8500);
    this.intervalIds.push(interval);
  }

  // 2. Ocean Waves with cyclical filter sweep and noise
  private startOceanWaves() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.25, ctx.currentTime);

    // LFO to create oceanic swell rhythm (approx 0.12 Hz = ~8 second ocean wave cycle)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.11, ctx.currentTime);
    lfoGain.gain.setValueAtTime(450, ctx.currentTime); // Frequency modulation
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(master);

    whiteNoise.start();
    lfo.start();
    this.activeNodes.push(whiteNoise, filter, waveGain, lfo, lfoGain);
  }

  // 3. Forest Rain with ambient pitter-patter
  private startForestRain() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.2, ctx.currentTime);

    noiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);

    noiseSource.start();
    this.activeNodes.push(noiseSource, rainFilter, rainGain);

    // Occasional leaf water droplet sound
    const playDroplet = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const dropOsc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      dropOsc.type = 'sine';
      const startFreq = 1400 + Math.random() * 800;
      dropOsc.frequency.setValueAtTime(startFreq, now);
      dropOsc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.08);

      dropGain.gain.setValueAtTime(0.04, now);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      dropOsc.connect(dropGain);
      dropGain.connect(this.masterGain);
      dropOsc.start(now);
      dropOsc.stop(now + 0.1);
      this.activeNodes.push(dropOsc, dropGain);
    };

    const interval = window.setInterval(() => {
      if (Math.random() > 0.4) playDroplet();
    }, 600);
    this.intervalIds.push(interval);
  }

  // 4. Deep Theta Binaural Waves (6Hz difference for deep meditative state)
  private startThetaBinaural() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    const carrier = 216; // 216 Hz carrier tone (A = 432 Hz subharmonic)
    const thetaDiff = 6; // 6 Hz theta frequency (deep meditation & insight)

    const merger = ctx.createChannelMerger(2);

    // Left channel: 216 Hz
    const oscLeft = ctx.createOscillator();
    const gainLeft = ctx.createGain();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(carrier, ctx.currentTime);
    gainLeft.gain.setValueAtTime(0.18, ctx.currentTime);
    oscLeft.connect(gainLeft);
    gainLeft.connect(merger, 0, 0);

    // Right channel: 222 Hz (216 + 6)
    const oscRight = ctx.createOscillator();
    const gainRight = ctx.createGain();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(carrier + thetaDiff, ctx.currentTime);
    gainRight.gain.setValueAtTime(0.18, ctx.currentTime);
    oscRight.connect(gainRight);
    gainRight.connect(merger, 0, 1);

    merger.connect(master);
    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, gainLeft, gainRight, merger);
  }

  // 5. Zen Windchimes (Pentatonic resonant bells)
  private startZenWindchimes() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    // Ambient soft hum
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(144, ctx.currentTime);
    humGain.gain.setValueAtTime(0.08, ctx.currentTime);
    hum.connect(humGain);
    humGain.connect(master);
    hum.start();
    this.activeNodes.push(hum, humGain);

    const chimeFrequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C Pentatonic

    const playChime = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const freq = chimeFrequencies[Math.floor(Math.random() * chimeFrequencies.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 4);
      this.activeNodes.push(osc, gain);
    };

    playChime();
    const interval = window.setInterval(() => {
      if (Math.random() > 0.3) {
        playChime();
        if (Math.random() > 0.6) {
          setTimeout(playChime, 250);
        }
      }
    }, 2800);
    this.intervalIds.push(interval);
  }
}

export const soundscapeEngine = new SoundscapeSynthesizer();
