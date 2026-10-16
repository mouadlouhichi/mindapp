import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Play,
  Compass,
} from 'lucide-react';
import {
  MeditationSession,
  SoundscapeType,
} from '../types/meditation';
import { Locale, TRANSLATIONS } from '../utils/i18n';
import { MEDITATION_IMAGES } from '../assets/images';

interface CustomSessionCreatorProps {
  onSessionCreated: (session: MeditationSession, startImmediately?: boolean) => void;
  initialTopic?: string;
  initialPromptDetails?: string;
  onCancel?: () => void;
  currentLocale: Locale;
}

const THEMES = [
  'Deep Restorative Sleep',
  'Anxiety & Nervous System Release',
  'Morning Vitality & Clear Intent',
  'Self-Compassion & Heart Opening',
  'Mountain of Stillness & Focus',
  'Overcoming Imposter Syndrome',
  'Cosmic Astral Surrender',
  'Quiet Mind & Thought Dissolution',
];

const SETTINGS = [
  { label: 'Kyoto Bamboo Grove', prompt: 'Misty emerald bamboo grove in Kyoto with morning dew and quiet stone lanterns', image: MEDITATION_IMAGES.bambooMist },
  { label: 'Celestial Deep Starlight', prompt: 'Ethereal celestial nebula with soft violet stardust and cosmic auroras', image: MEDITATION_IMAGES.cosmicNebula },
  { label: 'Golden Dawn Lotus Pond', prompt: 'Sacred golden water lily blossom floating on a still mirror pond at sunrise', image: MEDITATION_IMAGES.goldenLotus },
  { label: 'Alpine Mountain Summit', prompt: 'Majestic solitary granite mountain peak above a quiet sea of dawn clouds', image: MEDITATION_IMAGES.zenMountain },
  { label: 'Sanctuary Pavilion', prompt: 'Sacred tranquil meditation sanctuary pavilion overlooking sunrise lotus lake', image: MEDITATION_IMAGES.hero },
  { label: 'Ancient Redwood Sanctuary', prompt: 'Ancient misty redwood forest with morning sunbeams piercing the high canopy', image: MEDITATION_IMAGES.bambooMist },
];

const VOICES = [
  { id: 'Kore', name: 'Maya (Kore)', character: 'Warm soothing therapist • Soft compassionate tone', tag: 'Recommended' },
  { id: 'Zephyr', name: 'Kai (Zephyr)', character: 'Calm grounded guide • Reassuring presence', tag: 'Centering' },
  { id: 'Fenrir', name: 'Fenrir', character: 'Deep resonant monk • Grounded bass cadence', tag: 'Deep Rest' },
  { id: 'Puck', name: 'Puck', character: 'Light serene guide • Gentle mindful whisper', tag: 'Gentle' },
  { id: 'Charon', name: 'Charon', character: 'Steady meditative anchor • Contemplative pace', tag: 'Stillness' },
];

const SOUNDSCAPES: { id: SoundscapeType; name: string; desc: string }[] = [
  { id: 'calm_piano', name: 'Meditative Felt Piano', desc: 'Gentle acoustic piano chords & arpeggios' },
  { id: 'tibetan_bowls', name: 'Tibetan Singing Bowls', desc: 'Resonant harmonic bronze' },
  { id: 'ocean_waves', name: 'Ocean Surf', desc: 'Rhythmic rolling sea tide' },
  { id: 'forest_rain', name: 'Forest Rain', desc: 'Gentle canopy droplets' },
  { id: 'binaural_theta', name: 'Theta Waves (6Hz)', desc: 'Binaural brainwave entrainment' },
  { id: 'zen_windchimes', name: 'Zen Windchimes', desc: 'Pentatonic metal chimes' },
  { id: 'none', name: 'Silence / Mute', desc: 'Vocal narration only' },
];

export const CustomSessionCreator: React.FC<CustomSessionCreatorProps> = ({
  onSessionCreated,
  initialTopic,
  initialPromptDetails,
  onCancel,
  currentLocale,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'Anxiety & Nervous System Release');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'grok'>('gemini');
  const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon'>('Kore');
  const [voiceStyle, setVoiceStyle] = useState('Slow, warm, deeply peaceful meditation guide with gentle pauses');
  const [soundscape, setSoundscape] = useState<SoundscapeType>('forest_rain');

  // Affordance for image size: 1K, 2K, 4K
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [imageAspectRatio, setImageAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');
  const [customVisualPrompt, setCustomVisualPrompt] = useState('');

  // Generation Pipeline Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result Preview
  const [generatedSession, setGeneratedSession] = useState<MeditationSession | null>(null);
  const t = TRANSLATIONS[currentLocale];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setProgressStatus(t.synthesizingBtn);

    const chosenSetting = SETTINGS[selectedSettingIndex];

    try {
      // 1. Script Generation (via Gemini or Grok)
      const scriptRes = await fetch('/api/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationMinutes,
          aiProvider,
          useGrok: aiProvider === 'grok',
          mood: 'Tranquil & Grounded',
          setting: chosenSetting.label,
          guideStyle: `${selectedVoice} - ${voiceStyle}`,
        }),
      });

      const scriptData = await scriptRes.json();
      const finalPrompt = customVisualPrompt.trim() || chosenSetting.prompt;

      // 2. High-Quality Image Generation (1K, 2K, 4K affordance via gemini-3-pro-image-preview)
      let generatedImageUrl = '';
      try {
        const imgRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: finalPrompt,
            imageSize,
            aspectRatio: imageAspectRatio,
          }),
        });
        const imgData = await imgRes.json();
        generatedImageUrl = imgData.imageUrl;
      } catch (e) {
        console.warn('Image error, fallback provided:', e);
      }

      // 3. Voiceover Narration via gemini-3.8-flash-tts
      let generatedAudioBase64 = '';
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: scriptData.fullScript || scriptData.stages?.map((s: any) => s.guidance).join(' <breath> '),
            voiceName: selectedVoice,
            style: voiceStyle,
          }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          generatedAudioBase64 = ttsData.audioBase64;
        }
      } catch (e) {
        console.warn('TTS error:', e);
      }

      const sessionObj: MeditationSession = {
        id: `custom-session-${Date.now()}`,
        title: scriptData.title || `${topic} Journey`,
        subtitle: scriptData.subtitle || `A custom ${durationMinutes}-minute meditation in ${chosenSetting.label}`,
        theme: topic,
        durationMinutes,
        mood: 'Serene & Centered',
        setting: chosenSetting.label,
        visualPrompt: finalPrompt,
        imageUrl: generatedImageUrl || chosenSetting.image || MEDITATION_IMAGES.bambooMist,
        imageSize,
        imageAspectRatio,
        audioBase64: generatedAudioBase64,
        audioVoice: selectedVoice,
        audioStyle: voiceStyle,
        fullScript: scriptData.fullScript || '',
        stages: scriptData.stages || [],
        mantra: scriptData.mantra || 'I am still, grounded, and at ease.',
        soundscape,
        breathingPattern: scriptData.breathingPattern || {
          name: 'Box Breathing (4-4-4-4)',
          inhale: 4,
          hold: 4,
          exhale: 4,
          pause: 4,
          description: 'Somatic parasympathetic nervous system regulation',
        },
        createdAt: Date.now(),
        playsCount: 0,
      };

      setGeneratedSession(sessionObj);
      setProgressStatus('');
    } catch (err: any) {
      console.error('Session generation failed:', err);
      setErrorMessage(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Studio Header */}
      <div className="border-b border-[#BCD0C8]/70 pb-6 flex items-baseline justify-between">
        <div className="space-y-1 text-start">
          <div className="text-xs font-mono uppercase tracking-widest text-[#175C62]">
            {t.atelierEyebrow}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#053333] rtl:font-sans">
            {t.atelierTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#1A2F32]/80 max-w-xl font-light leading-relaxed">
            {t.atelierSubtitle}
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-[#175C62] hover:text-[#053333] transition-colors"
          >
            {t.returnToSanctuary}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Intent & Duration */}
          <div className="p-6 sm:p-7 rounded-[1.5rem] border border-[#BCD0C8]/80 bg-white shadow-xs space-y-4 text-start">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#175C62] font-semibold">
              {t.step1Title}
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#053333] block">
                {t.themeLabel}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.themePlaceholder}
                className="w-full px-4 py-3 min-h-11 bg-[#FCFCF8] border border-[#BCD0C8] rounded-xl text-xs text-[#053333] placeholder-[#175C62]/50 focus:outline-none focus:border-[#175C62] transition-colors"
              />
            </div>

            {/* Segmented Quick Themes */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {THEMES.map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTopic(th)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    topic === th
                      ? 'bg-[#175C62] text-white font-medium shadow-xs'
                      : 'text-[#1A2F32]/80 hover:text-[#053333] hover:bg-[#DAE7DE]/50 border border-[#BCD0C8]/60'
                  }`}
                >
                  {th}
                </button>
              ))}
            </div>

            {/* AI Engine Choice (Gemini vs Grok) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#053333] block">
                  AI Wisdom Engine
                </span>
                <span className="text-[10px] font-mono text-[#175C62]">
                  {aiProvider === 'gemini' ? 'Google Gemini 3.8' : 'xAI Grok-2 Mindful'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#DAE7DE]/40 rounded-full border border-[#BCD0C8]/80">
                <button
                  type="button"
                  onClick={() => setAiProvider('gemini')}
                  className={`py-1.5 px-3 text-xs rounded-full transition-colors font-medium flex items-center justify-center gap-1.5 ${
                    aiProvider === 'gemini'
                      ? 'bg-[#175C62] text-white shadow-xs'
                      : 'text-[#1A2F32]/80 hover:text-[#053333]'
                  }`}
                >
                  <Sparkles className="size-3.5" />
                  <span>Gemini 3.8 Flash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiProvider('grok')}
                  className={`py-1.5 px-3 text-xs rounded-full transition-colors font-medium flex items-center justify-center gap-1.5 ${
                    aiProvider === 'grok'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'text-[#1A2F32]/80 hover:text-[#053333]'
                  }`}
                >
                  <span>🌌</span>
                  <span>Grok-2 (xAI)</span>
                </button>
              </div>
            </div>

            {/* Duration Segmented Pills */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-[#053333] block">
                {t.durationLabel}
              </span>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-[#DAE7DE]/40 rounded-full border border-[#BCD0C8]/80">
                {[1, 3, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`py-2 text-xs font-mono rounded-full transition-colors ${
                      durationMinutes === m
                        ? 'bg-[#175C62] text-white font-semibold shadow-xs'
                        : 'text-[#1A2F32]/80 hover:text-[#053333]'
                    }`}
                  >
                    {m}{t.minLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Visual Scenery & Resolution Affordance (gemini-3-pro-image-preview) */}
          <div className="p-6 sm:p-7 rounded-[1.5rem] border border-[#BCD0C8]/80 bg-white shadow-xs space-y-5 text-start">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#175C62] font-semibold">
                {t.step2Title}
              </h2>
              <span className="text-[10px] font-mono text-[#175C62]/70 bg-[#DAE7DE]/60 px-2.5 py-0.5 rounded-full">
                gemini-3-pro-image-preview
              </span>
            </div>

            {/* Atmospheric Setting Options with Real Imagery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SETTINGS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedSettingIndex(idx)}
                  className={`p-2.5 text-start rounded-xl border transition-all flex items-center gap-3 ${
                    selectedSettingIndex === idx
                      ? 'bg-[#DAE7DE]/70 border-[#175C62] text-[#053333] shadow-xs ring-1 ring-[#175C62]/30'
                      : 'bg-white border-[#BCD0C8]/80 text-[#1A2F32]/80 hover:border-[#175C62]/50 hover:bg-[#DAE7DE]/20'
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.label}
                    className="size-11 rounded-lg object-cover shrink-0 border border-black/10 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate text-[#053333]">{s.label}</div>
                    <div className="text-[10px] text-[#175C62]/70 truncate">{s.prompt}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Image Size Affordance (1K, 2K, 4K) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#053333]">
                  {t.resolutionAffordance}
                </span>
                <span className="text-[#175C62] font-mono text-[11px]">
                  {imageSize === '1K' && '1024 × 576 Standard'}
                  {imageSize === '2K' && '2048 × 1152 High Definition'}
                  {imageSize === '4K' && '3840 × 2160 Ultra Masterpiece'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#DAE7DE]/40 rounded-full border border-[#BCD0C8]/80">
                {(['1K', '2K', '4K'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setImageSize(sz)}
                    className={`py-2 text-xs font-mono rounded-full transition-colors text-center ${
                      imageSize === sz
                        ? 'bg-[#175C62] text-white font-semibold shadow-xs'
                        : 'text-[#1A2F32]/80 hover:text-[#053333]'
                    }`}
                  >
                    {sz} {t.artLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#053333] block">
                {t.aspectRatioLabel}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9' },
                  { id: '1:1', label: '1:1' },
                  { id: '9:16', label: '9:16' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setImageAspectRatio(r.id as any)}
                    className={`py-2 text-xs font-mono rounded-xl border transition-colors ${
                      imageAspectRatio === r.id
                        ? 'bg-[#DAE7DE]/60 border-[#175C62] text-[#053333] font-semibold'
                        : 'bg-white border-[#BCD0C8]/80 text-[#1A2F32]/80 hover:border-[#175C62]/50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Voiceover & Soundscape (gemini-3.8-flash-tts) */}
          <div className="p-6 sm:p-7 rounded-[1.5rem] border border-[#BCD0C8]/80 bg-white shadow-xs space-y-5 text-start">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#175C62] font-semibold">
                {t.step3Title}
              </h2>
              <span className="text-[10px] font-mono text-[#175C62]/70 bg-[#DAE7DE]/60 px-2.5 py-0.5 rounded-full">
                gemini-3.8-flash-tts
              </span>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#053333] block">
                {t.voicePersonaLabel}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoice(v.id as any)}
                    className={`p-3.5 text-start rounded-xl border transition-colors ${
                      selectedVoice === v.id
                        ? 'bg-[#DAE7DE]/60 border-[#175C62] text-[#053333]'
                        : 'bg-white border-[#BCD0C8]/80 text-[#1A2F32]/80 hover:border-[#175C62]/50'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#053333]">{v.name}</div>
                    <div className="text-[11px] text-[#175C62]/80 mt-0.5">{v.character}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Soundscape */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#053333] block">
                {t.acousticTrackLabel}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOUNDSCAPES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSoundscape(sc.id)}
                    className={`p-2.5 text-start rounded-xl border transition-colors ${
                      soundscape === sc.id
                        ? 'bg-[#DAE7DE]/60 border-[#175C62] text-[#053333]'
                        : 'bg-white border-[#BCD0C8]/80 text-[#1A2F32]/80 hover:border-[#175C62]/50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#053333]">{sc.name}</div>
                    <div className="text-[10px] text-[#175C62]/80 truncate mt-0.5">{sc.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Button (MindRested Pill CTA with 44px min height) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 min-h-12 py-3.5 rounded-full bg-[#175C62] hover:bg-[#123F40] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.synthesizingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generateBtn}</span>
                </>
              )}
            </button>

            {progressStatus && (
              <div className="mt-3 p-3.5 rounded-2xl bg-[#DAE7DE]/50 border border-[#BCD0C8] text-xs text-[#053333] text-start">
                {progressStatus}
              </div>
            )}

            {errorMessage && (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-start">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 sm:p-7 rounded-[1.5rem] border border-[#BCD0C8]/80 bg-white shadow-sm space-y-4 text-start">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#175C62] font-semibold pb-2 border-b border-[#BCD0C8]/60">
              {t.previewTitle}
            </h3>

            {generatedSession ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 border border-[#BCD0C8]">
                  <img
                    src={generatedSession.imageUrl}
                    alt={generatedSession.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#175C62] uppercase tracking-wider">
                    {generatedSession.theme} · {generatedSession.durationMinutes} {t.minLabel}
                  </div>
                  <h4 className="text-xl font-display font-semibold text-[#053333] rtl:font-sans">
                    {generatedSession.title}
                  </h4>
                  <p className="text-xs text-[#1A2F32]/80 font-light leading-relaxed">
                    {generatedSession.subtitle}
                  </p>
                </div>

                <blockquote className="border-s-2 border-[#175C62]/40 ps-3.5 py-1 text-xs italic font-serif text-[#0E3337] bg-[#FCF2E8]/40 rounded-e-lg">
                  "{generatedSession.mantra}"
                </blockquote>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onSessionCreated(generatedSession, true)}
                    className="w-full flex items-center justify-center gap-2 min-h-11 py-2.5 rounded-full bg-[#175C62] hover:bg-[#123F40] text-white font-semibold text-xs tracking-wide shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{t.beginSession}</span>
                  </button>

                  <button
                    onClick={() => onSessionCreated(generatedSession, false)}
                    className="w-full min-h-11 py-2.5 rounded-full border border-[#BCD0C8] hover:bg-[#FCF2E8] text-[#175C62] text-xs font-semibold transition-colors"
                  >
                    {t.saveToSanctuary}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-[#1A2F32]/60 font-light space-y-2">
                <Compass className="w-8 h-8 mx-auto text-[#175C62]/50 stroke-[1.5]" />
                <p>{t.previewEmptyPrompt}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
