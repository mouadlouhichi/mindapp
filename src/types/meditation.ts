export interface MeditationStage {
  time: string;
  title: string;
  guidance: string;
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | 'pause';
}

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  description: string;
}

export type SoundscapeType = 'tibetan_bowls' | 'ocean_waves' | 'forest_rain' | 'binaural_theta' | 'zen_windchimes' | 'none';

export interface MeditationSession {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  durationMinutes: number;
  mood: string;
  setting: string;
  visualPrompt: string;
  imageUrl?: string;
  imageSize?: '1K' | '2K' | '4K';
  imageAspectRatio?: string;
  audioBase64?: string;
  audioVoice?: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  audioStyle?: string;
  fullScript: string;
  stages: MeditationStage[];
  mantra: string;
  soundscape: SoundscapeType;
  breathingPattern: BreathingPattern;
  createdAt: number;
  isFavorite?: boolean;
  playsCount?: number;
}

export type ChatRole = 'zen-master' | 'serenity-coach' | 'instant-calmer';
export type GeminiModel = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
  roleName?: string;
}

export interface RoleConfig {
  id: ChatRole;
  name: string;
  title: string;
  model: GeminiModel;
  tagline: string;
  avatar: string;
  badgeColor: string;
  description: string;
}
