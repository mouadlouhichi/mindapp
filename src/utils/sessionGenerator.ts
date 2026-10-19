import { MeditationSession, SoundscapeType } from '../types/meditation';
import { MEDITATION_IMAGES } from '../assets/images';

export interface GenerateSessionParams {
  topic: string;
  durationMinutes: number;
  mood?: string;
  setting?: string;
  guideStyle?: string;
  voiceName?: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon';
  soundscape?: SoundscapeType;
  imageSize?: '1K' | '2K' | '4K';
  imageAspectRatio?: '16:9' | '1:1' | '9:16';
  imageUrl?: string;
}

export function generateClientSession(params: GenerateSessionParams): MeditationSession {
  const {
    topic = 'Anxiety & Nervous System Release',
    durationMinutes = 5,
    setting = 'Kyoto Bamboo Grove',
    guideStyle = 'Kore - Slow, warm, deeply peaceful meditation guide with gentle pauses',
    voiceName = 'Kore',
    soundscape = 'forest_rain',
    imageSize = '2K',
    imageAspectRatio = '16:9',
    imageUrl = MEDITATION_IMAGES.bambooMist,
  } = params;

  const totalSeconds = durationMinutes * 60;
  const stage1Time = '0:00';
  const stage2Time = `${Math.floor(totalSeconds * 0.2 / 60)}:${Math.floor((totalSeconds * 0.2) % 60).toString().padStart(2, '0')}`;
  const stage3Time = `${Math.floor(totalSeconds * 0.5 / 60)}:${Math.floor((totalSeconds * 0.5) % 60).toString().padStart(2, '0')}`;
  const stage4Time = `${Math.floor(totalSeconds * 0.8 / 60)}:${Math.floor((totalSeconds * 0.8) % 60).toString().padStart(2, '0')}`;
  const stage5Time = `${durationMinutes}:00`;

  const stages = [
    {
      time: stage1Time,
      title: 'Arriving & Somatic Grounding',
      guidance: `Welcome to this sacred space of ${topic.toLowerCase()}. Gently allow your eyelids to soften and close. Drop your shoulders down away from your ears, and feel the solid ground holding you effortlessly.`,
      breathingPhase: 'inhale' as const,
    },
    {
      time: stage2Time,
      title: 'The Oceanic Wave of Breath',
      guidance: `Begin to lengthen your inhalation... drawing in pure, tranquil stillness. And as you exhale, feel any tension, gripping, or racing thoughts melt away into the earth.`,
      breathingPhase: 'exhale' as const,
    },
    {
      time: stage3Time,
      title: `Sanctuary Journey in ${setting}`,
      guidance: `Visualize yourself resting in ${setting.toLowerCase()}. The air is cool and peaceful. You are completely safe here. There is nothing to achieve, nowhere to rush, and nothing you need to fix.`,
      breathingPhase: 'hold' as const,
    },
    {
      time: stage4Time,
      title: 'Quiet Presence & Sacred Stillness',
      guidance: `Rest in this spacious awareness. Beneath all fleeting thoughts is a deep reservoir of calm that has never been shaken. Breathe into this quiet sanctuary within you.`,
      breathingPhase: 'pause' as const,
    },
    {
      time: stage5Time,
      title: 'Gentle Awakening & Integrated Peace',
      guidance: `Take one final, deep breath filled with gentle gratitude. Slowly bring gentle movement to your fingers and toes, carrying this serene presence with you into your day.`,
      breathingPhase: 'exhale' as const,
    },
  ];

  const fullScript = stages.map((s) => s.guidance).join(' <breath> ');
  const mantra = `In this quiet breath, I am safe, grounded, and completely at peace.`;

  return {
    id: `custom-session-${Date.now()}`,
    title: `${topic} Journey`,
    subtitle: `A soothing ${durationMinutes}-minute guided sanctuary in ${setting}`,
    theme: topic,
    durationMinutes,
    mood: 'Serene & Grounded',
    setting,
    visualPrompt: `${setting}, ethereal meditative atmosphere, volumetric soft lighting, serene zen tranquility`,
    imageUrl,
    imageSize,
    imageAspectRatio,
    audioVoice: voiceName,
    audioStyle: guideStyle,
    fullScript,
    stages,
    mantra,
    soundscape,
    breathingPattern: {
      name: 'Box Breathing (4-4-4-4)',
      inhale: 4,
      hold: 4,
      exhale: 4,
      pause: 4,
      description: 'Stabilizes autonomic arousal and restores sharp, grounded equilibrium.',
    },
    createdAt: Date.now(),
    playsCount: 0,
  };
}
