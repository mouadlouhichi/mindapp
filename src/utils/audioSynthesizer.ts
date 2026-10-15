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
      case 'calm_piano':
        this.startCalmPiano();
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

  // 6. Calm Meditative Felt Piano (Eno/Satie Inspired Acoustic Chords & Arpeggios)
  public playPianoNote(freq: number, velocity: number = 0.35, pan: number = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Multi-harmonic soft felt piano model
    const fundOsc = ctx.createOscillator();
    const h2Osc = ctx.createOscillator();
    const h3Osc = ctx.createOscillator();

    fundOsc.type = 'sine';
    fundOsc.frequency.setValueAtTime(freq, now);

    h2Osc.type = 'sine';
    h2Osc.frequency.setValueAtTime(freq * 2, now);

    h3Osc.type = 'triangle';
    h3Osc.frequency.setValueAtTime(freq * 3, now);

    const noteGain = ctx.createGain();
    const h2Gain = ctx.createGain();
    const h3Gain = ctx.createGain();

    h2Gain.gain.setValueAtTime(0.22, now);
    h3Gain.gain.setValueAtTime(0.06, now);

    fundOsc.connect(noteGain);
    h2Osc.connect(h2Gain);
    h2Gain.connect(noteGain);
    h3Osc.connect(h3Gain);
    h3Gain.connect(noteGain);

    // Warm Lowpass Filter (Felt Piano Muffle)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = Math.min(2200, Math.max(400, freq * 3.5));
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(220, cutoff * 0.45), now + 3.0);
    filter.Q.setValueAtTime(0.8, now);

    noteGain.connect(filter);

    // Dynamic ADSR Envelope
    const ampGain = ctx.createGain();
    ampGain.gain.setValueAtTime(0.0001, now);
    ampGain.gain.linearRampToValueAtTime(velocity * 0.38, now + 0.02);
    ampGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);

    filter.connect(ampGain);

    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.7, Math.min(0.7, pan)), now);
      ampGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      ampGain.connect(this.masterGain);
    }

    fundOsc.start(now);
    h2Osc.start(now);
    h3Osc.start(now);

    fundOsc.stop(now + 5.5);
    h2Osc.stop(now + 5.5);
    h3Osc.stop(now + 5.5);

    this.activeNodes.push(fundOsc, h2Osc, h3Osc, noteGain, ampGain, filter);
  }

  public playPianoChord(frequencies: number[], velocity: number = 0.3) {
    frequencies.forEach((freq, idx) => {
      window.setTimeout(() => {
        if (!this.ctx) return;
        const pan = (idx - (frequencies.length - 1) / 2) * 0.22;
        this.playPianoNote(freq, velocity * (0.85 + Math.random() * 0.25), pan);
      }, idx * 120);
    });
  }

  // Pure Sacred Singing Bell / Chime for stage transitions
  public playSingingBell(freq: number = 432) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const bellGain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // Harmonic Tibetan bowl overtone

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.2, now);

    osc1.connect(bellGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(bellGain);

    bellGain.gain.setValueAtTime(0.0001, now);
    bellGain.gain.linearRampToValueAtTime(0.25, now + 0.03);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

    bellGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 5.8);
    osc2.stop(now + 5.8);

    this.activeNodes.push(osc1, osc2, bellGain);
  }

  private startCalmPiano() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;

    // Warm sub-bass foundation
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    subGain.gain.setValueAtTime(0.04, ctx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start();
    this.activeNodes.push(subOsc, subGain);

    // Ethereal chord progressions (Cmaj9, Am9, Fmaj7, G6, Em7)
    const progressions = [
      [130.81, 196.00, 246.94, 329.63, 493.88], // Cmaj9 (C3, G3, B3, E4, B4)
      [110.00, 164.81, 261.63, 329.63, 392.00], // Am9 (A2, E3, C4, E4, G4)
      [87.31, 130.81, 220.00, 329.63, 523.25],  // Fmaj7 (F2, C3, A3, E4, C5)
      [98.00, 146.83, 246.94, 293.66, 392.00],  // G6 (G2, D3, B3, D4, G4)
      [82.41, 123.47, 196.00, 293.66, 329.63],  // Em7 (E2, B2, G3, D4, E4)
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isPlaying || !this.ctx) return;
      const chord = progressions[chordIdx % progressions.length];
      chordIdx++;

      this.playPianoChord(chord, 0.32);

      // Random delicate melody note in between
      window.setTimeout(() => {
        if (!this.isPlaying || !this.ctx) return;
        const melodyNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const randomNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        this.playPianoNote(randomNote, 0.22, (Math.random() - 0.5) * 0.6);
      }, 2100);
    };

    playNextChord();
    const interval = window.setInterval(playNextChord, 4600);
    this.intervalIds.push(interval);
  }
}

export const soundscapeEngine = new SoundscapeSynthesizer();
