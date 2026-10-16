import { soundscapeEngine } from './audioSynthesizer';
import { Locale } from './i18n';

export interface TherapistVoiceOptions {
  voiceName?: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  rate?: number;
  pitch?: number;
  volume?: number;
  locale?: Locale;
  withPianoChords?: boolean;
  withStageChime?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

class TherapistVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicePlaying: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
    }
  }

  public getAvailableVoices(locale: Locale = 'en'): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const all = this.synth.getVoices();
    const langPrefix = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en';
    return all.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  }

  private pickTherapistVoice(locale: Locale = 'en', preference?: string): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    const langPrefix = locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en';
    const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

    if (langVoices.length === 0) return voices[0];

    // Priority for warm, high-quality human/natural voices
    const keywords = ['natural', 'serena', 'samantha', 'karen', 'daniel', 'amelie', 'tarik', 'maged', 'google', 'premium'];
    for (const kw of keywords) {
      const match = langVoices.find((v) => v.name.toLowerCase().includes(kw));
      if (match) return match;
    }

    return langVoices[0];
  }

  public speak(
    rawText: string,
    options: TherapistVoiceOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.stop();

      const {
        rate = 0.82, // slow, gentle cadence for therapy
        pitch = 0.94, // warm grounded resonance
        volume = 0.8,
        locale = 'en',
        withPianoChords = true,
        withStageChime = true,
        onStart,
        onEnd,
      } = options;

      // Clean text and split on <breath> tags for mindful breathing pauses
      const cleanText = rawText.replace(/\[\d+:\d+\]/g, '').trim();
      const segments = cleanText.split(/<breath>/i).map((s) => s.trim()).filter(Boolean);

      if (segments.length === 0) {
        resolve();
        return;
      }

      this.isVoicePlaying = true;

      // 1. Strike gentle opening singing bell if requested
      if (withStageChime) {
        soundscapeEngine.playSingingBell(432);
      }

      // 2. Play warm opening piano chord accompaniment if requested
      if (withPianoChords) {
        // Pentatonic Cmaj9 chord (C3, G3, B3, E4)
        soundscapeEngine.playPianoChord([130.81, 196.00, 246.94, 329.63], 0.28);
      }

      let segmentIndex = 0;

      const speakNextSegment = () => {
        if (!this.isVoicePlaying || segmentIndex >= segments.length) {
          this.isVoicePlaying = false;
          if (onEnd) onEnd();
          resolve();
          return;
        }

        const segmentText = segments[segmentIndex];
        segmentIndex++;

        const utterance = new SpeechSynthesisUtterance(segmentText);
        this.currentUtterance = utterance;

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        const voice = this.pickTherapistVoice(locale);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onstart = () => {
          if (segmentIndex === 1 && onStart) onStart();
        };

        utterance.onend = () => {
          if (!this.isVoicePlaying) {
            resolve();
            return;
          }

          // If there are more segments (i.e. we hit a <breath> tag), insert mindful breathing pause & soft piano note
          if (segmentIndex < segments.length) {
            if (withPianoChords) {
              // Gentle transition piano notes
              soundscapeEngine.playPianoNote(261.63, 0.22, 0.2); // C4
              setTimeout(() => {
                soundscapeEngine.playPianoNote(329.63, 0.18, -0.2); // E4
              }, 400);
            }

            // Mindful pause for 2.2 seconds before the next segment
            window.setTimeout(speakNextSegment, 2200);
          } else {
            this.isVoicePlaying = false;
            if (onEnd) onEnd();
            resolve();
          }
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis utterance error:', e);
          this.isVoicePlaying = false;
          if (onEnd) onEnd();
          resolve();
        };

        // iOS Safari and Chrome keep-alive hack
        if (this.synth) {
          if (this.synth.paused) {
            this.synth.resume();
          }
          this.synth.speak(utterance);
        }
      };

      // Slight pre-delay so bell and piano chord can ring softly before speaking
      const preDelay = withStageChime || withPianoChords ? 650 : 50;
      window.setTimeout(speakNextSegment, preDelay);
    });
  }

  public stop() {
    this.isVoicePlaying = false;
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public pause() {
    if (this.synth && this.isVoicePlaying) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public isPlaying(): boolean {
    return this.isVoicePlaying;
  }
}

export const therapistVoiceEngine = new TherapistVoiceEngine();
