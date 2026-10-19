import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkles,
  Wind,
  Heart,
  ChevronLeft,
  Headphones,
  Music,
  Radio,
} from 'lucide-react';
import { MeditationSession, SoundscapeType } from '../types/meditation';
import { soundscapeEngine } from '../utils/audioSynthesizer';
import { therapistVoiceEngine } from '../utils/therapistVoiceEngine';
import { BreathingVisualizer } from './BreathingVisualizer';
import { Locale, TRANSLATIONS } from '../utils/i18n';
import { resolveSessionImageUrl } from '../assets/images';

interface SessionPlayerModalProps {
  session: MeditationSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSession?: (updatedSession: MeditationSession) => void;
  currentLocale?: Locale;
}

export const SessionPlayerModal: React.FC<SessionPlayerModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdateSession,
  currentLocale = 'en',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(session.durationMinutes * 60);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const [voiceVolume, setVoiceVolume] = useState<number>(0.9);
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(session.soundscape);

  // Therapist Vocal Effects & Piano Accompaniment
  const [enableWarmth, setEnableWarmth] = useState<boolean>(true);
  const [enableReverb, setEnableReverb] = useState<boolean>(true);
  const [reverbLevel, setReverbLevel] = useState<number>(0.28);
  const [enablePiano, setEnablePiano] = useState<boolean>(true);
  const fallbackSpeechRef = useRef<{ cancel: () => void } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showBreathingCircle, setShowBreathingCircle] = useState<boolean>(true);
  const [showScriptDrawer, setShowScriptDrawer] = useState<boolean>(false);
  const [showMixerDrawer, setShowMixerDrawer] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState<boolean>(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState<boolean>(false);
  const [imageSizeChoice, setImageSizeChoice] = useState<'1K' | '2K' | '4K'>(session.imageSize || '2K');
  const [voiceChoice, setVoiceChoice] = useState<'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon'>(
    session.audioVoice || 'Kore'
  );

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const t = TRANSLATIONS[currentLocale];

  const currentStageIndex = Math.min(
    session.stages.length - 1,
    Math.floor((currentTime / Math.max(1, duration)) * session.stages.length)
  );
  const activeStage = session.stages[currentStageIndex] || session.stages[0];

  const resolveAudioSource = (sess: MeditationSession): string | null => {
    if (sess.audioBase64) {
      if (sess.audioBase64.startsWith('data:')) return sess.audioBase64;
      const isMp3 =
        sess.audioBase64.startsWith('SUQz') ||
        sess.audioBase64.startsWith('//PEw') ||
        sess.audioBase64.startsWith('//tE');
      return `data:${isMp3 ? 'audio/mp3' : 'audio/wav'};base64,${sess.audioBase64}`;
    }
    return sess.audioUrl || null;
  };

  useEffect(() => {
    if (!isOpen) {
      soundscapeEngine.stop();
      therapistVoiceEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const targetSeconds = session.durationMinutes * 60;
    setDuration(targetSeconds);
    setCurrentTime(0);
    setIsCompleted(false);

    const audioSrc = resolveAudioSource(session);
    if (audioSrc) {
      if (!audioElementRef.current) audioElementRef.current = new Audio();
      audioElementRef.current.src = audioSrc;
      audioElementRef.current.volume = voiceVolume;
      audioElementRef.current.playbackRate = playbackRate;

      // Attach acoustic effects chain (warmth low-shelf + sanctuary reverb)
      soundscapeEngine.attachTherapistEffects(audioElementRef.current, {
        enableWarmth,
        enableReverb,
        reverbAmount: reverbLevel,
      });

      audioElementRef.current.onloadedmetadata = () => {
        if (audioElementRef.current && audioElementRef.current.duration > 0) {
          setDuration(audioElementRef.current.duration);
        }
      };

      audioElementRef.current.onended = () => {
        setIsPlaying(false);
        setIsCompleted(true);
      };
    }

    if (currentSoundscape !== 'none') {
      soundscapeEngine.play(currentSoundscape, ambientVolume);
    } else if (enablePiano) {
      setCurrentSoundscape('calm_piano');
      soundscapeEngine.play('calm_piano', ambientVolume);
    }

    return () => {
      soundscapeEngine.stop();
      therapistVoiceEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
      if (fallbackSpeechRef.current) fallbackSpeechRef.current.cancel();
    };
  }, [isOpen, session.id]);

  useEffect(() => {
    soundscapeEngine.setVolume(ambientVolume);
  }, [ambientVolume]);

  useEffect(() => {
    soundscapeEngine.setVocalEffects(enableWarmth, enableReverb, reverbLevel);
  }, [enableWarmth, enableReverb, reverbLevel]);

  useEffect(() => {
    if (audioElementRef.current) audioElementRef.current.volume = voiceVolume;
  }, [voiceVolume]);

  useEffect(() => {
    if (audioElementRef.current) audioElementRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const hasAudio = Boolean(resolveAudioSource(session));
    if (isPlaying) {
      timerIntervalRef.current = window.setInterval(() => {
        if (audioElementRef.current && hasAudio) {
          setCurrentTime(audioElementRef.current.currentTime);
        } else {
          setCurrentTime((prev) => {
            if (prev >= duration) {
              setIsPlaying(false);
              setIsCompleted(true);
              return duration;
            }
            return prev + 1;
          });
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying, duration, session.audioBase64, session.audioUrl]);

  const togglePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    const audioSrc = resolveAudioSource(session);

    if (nextState) {
      if (isCompleted) {
        setCurrentTime(0);
        setIsCompleted(false);
      }
      if (currentSoundscape !== 'none') {
        soundscapeEngine.play(currentSoundscape, ambientVolume);
      } else if (enablePiano) {
        setCurrentSoundscape('calm_piano');
        soundscapeEngine.play('calm_piano', ambientVolume);
      }

      if (audioElementRef.current && audioSrc) {
        soundscapeEngine.attachTherapistEffects(audioElementRef.current, {
          enableWarmth,
          enableReverb,
          reverbAmount: reverbLevel,
        });
        audioElementRef.current.play().catch(console.warn);
      } else if (!audioSrc && !isRegeneratingAudio) {
        // Automatically start therapist voiceover & piano!
        handleGenerateVoiceover();
      }
    } else {
      soundscapeEngine.stop();
      therapistVoiceEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
      if (fallbackSpeechRef.current) fallbackSpeechRef.current.cancel();
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioElementRef.current && resolveAudioSource(session)) {
      audioElementRef.current.currentTime = newTime;
    }
  };

  const handleSoundscapeChange = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    if (isPlaying) soundscapeEngine.play(type, ambientVolume);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.warn);
      setIsFullscreen(false);
    }
  };

  const handleGenerateVoiceover = async (targetVoice?: 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck' | 'Charon') => {
    setIsRegeneratingAudio(true);
    const chosenVoice = targetVoice || voiceChoice;

    // Start soothing calm piano accompaniment
    if (enablePiano && (currentSoundscape === 'none' || currentSoundscape === 'calm_piano')) {
      setCurrentSoundscape('calm_piano');
      soundscapeEngine.play('calm_piano', ambientVolume);
    }

    try {
      const scriptText = session.fullScript || session.stages.map((s) => s.guidance).join(' <breath> ');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          voiceName: chosenVoice,
          style: session.audioStyle || 'A warm, licensed clinical therapist speaking slowly and soothingly with comforting cadence, gentle breath pauses, and reassuring presence',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'TTS generation unavailable');
      }

      const updatedSession: MeditationSession = {
        ...session,
        audioBase64: data.audioBase64,
        audioVoice: chosenVoice,
      };

      const mime = data.mimeType || 'audio/mp3';
      const audioDataUrl = `data:${mime};base64,${data.audioBase64}`;

      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      audioElementRef.current.src = audioDataUrl;
      audioElementRef.current.volume = voiceVolume;
      audioElementRef.current.playbackRate = playbackRate;

      // Attach therapist vocal effects (warmth + reverb)
      soundscapeEngine.attachTherapistEffects(audioElementRef.current, {
        enableWarmth,
        enableReverb,
        reverbAmount: reverbLevel,
      });

      if (isPlaying) {
        audioElementRef.current.play().catch(console.warn);
      }

      if (onUpdateSession) onUpdateSession(updatedSession);
    } catch (err: any) {
      console.warn('TTS API notice, activating therapeutic voice synthesis fallback with piano:', err);
      if (enablePiano && (currentSoundscape === 'none' || currentSoundscape === 'calm_piano')) {
        setCurrentSoundscape('calm_piano');
        soundscapeEngine.play('calm_piano', ambientVolume);
      }
      const scriptText = session.fullScript || session.stages.map((s) => s.guidance).join(' <breath> ');
      therapistVoiceEngine.speak(scriptText, {
        locale: currentLocale,
        withPianoChords: enablePiano,
        withStageChime: true,
        onEnd: () => {
          setIsPlaying(false);
          setIsCompleted(true);
        },
        onStart: () => {
          setIsPlaying(true);
        },
      });
    } finally {
      setIsRegeneratingAudio(false);
    }
  };

  const handleGenerateNewImage = async (chosenSize: '1K' | '2K' | '4K') => {
    setIsRegeneratingImage(true);
    setImageSizeChoice(chosenSize);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: session.visualPrompt || `${session.setting}, serene meditative sanctuary`,
          imageSize: chosenSize,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      const updatedSession: MeditationSession = {
        ...session,
        imageUrl: data.imageUrl,
        imageSize: chosenSize,
      };

      if (onUpdateSession) onUpdateSession(updatedSession);
    } catch (err: any) {
      console.error('Image error:', err);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={playerContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#053333] select-none overflow-hidden"
    >
      {/* Background Visualizer with Subtle Ken Burns Zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={resolveSessionImageUrl(session.imageUrl, `${session.title} ${session.theme}`)}
          alt={session.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = resolveSessionImageUrl(undefined, `${session.title} ${session.theme}`);
          }}
          className={`w-full h-full object-cover transition-transform duration-[30000ms] ease-out ${
            isPlaying ? 'scale-110 filter brightness-75' : 'scale-100 filter brightness-65'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#053333] via-black/40 to-[#053333]/80" />
      </div>

      {/* Signature MindRested Concentric Rings in top corners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 size-96 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-10 -top-10 size-64 rounded-full border border-white/10"
      />

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-6 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="size-9 sm:size-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors shrink-0"
            title="Exit Session"
          >
            <ChevronLeft className="size-4 sm:size-5 rtl:-scale-x-100" />
          </button>
          <div className="text-start min-w-0">
            <h2 className="text-sm sm:text-xl font-display font-semibold text-white drop-shadow rtl:font-sans truncate max-w-[170px] sm:max-w-md">
              {session.title}
            </h2>
            <div className="text-[10px] sm:text-xs font-mono text-[#DAE7DE] drop-shadow flex items-center gap-1.5 sm:gap-2 truncate">
              <span>{session.theme}</span>
              <span aria-hidden="true">·</span>
              <span>{session.audioVoice || 'Kore'} {t.voiceLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Toggle Breathing Circle */}
          <button
            onClick={() => setShowBreathingCircle(!showBreathingCircle)}
            className={`size-9 sm:size-11 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors ${
              showBreathingCircle
                ? 'bg-[#175C62] border-white/30 text-white'
                : 'bg-black/40 border-white/20 text-white/70 hover:text-white'
            }`}
            title="Toggle Breathing Guide"
          >
            <Wind className="size-3.5 sm:size-4" />
          </button>

          {/* Sound & Voice Settings */}
          <button
            onClick={() => setShowMixerDrawer(!showMixerDrawer)}
            className={`size-9 sm:size-11 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors ${
              showMixerDrawer
                ? 'bg-[#175C62] border-white/30 text-white'
                : 'bg-black/40 border-white/20 text-white/70 hover:text-white'
            }`}
            title="Soundscape & Mixer"
          >
            <Sliders className="size-3.5 sm:size-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex size-9 sm:size-11 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md items-center justify-center transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <button
            onClick={onClose}
            className="size-9 sm:size-11 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>
      </div>

      {/* Center Stage & Teleprompter */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-20 pb-36 sm:py-24 flex flex-col items-center justify-start sm:justify-center max-w-xl mx-auto w-full text-center space-y-4 sm:space-y-6 no-scrollbar">
        {showBreathingCircle && (
          <div className="transform scale-90 sm:scale-95 transition-all w-full flex justify-center">
            <BreathingVisualizer
              pattern={session.breathingPattern}
              compact={false}
              theme="dark"
              currentLocale={currentLocale}
            />
          </div>
        )}

        {/* Teleprompter Card */}
        <div className="w-full max-w-lg p-5 sm:p-7 rounded-[1.5rem] bg-[#123F40]/85 backdrop-blur-xl border border-white/15 text-white shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#DAE7DE] uppercase tracking-widest pb-2 border-b border-white/10">
            <span>
              {t.stageLabel} {currentStageIndex + 1} {t.ofLabel} {session.stages.length}
            </span>
            <span>{activeStage.time}</span>
          </div>

          <h3 className="text-base sm:text-lg font-display font-semibold text-white rtl:font-sans">
            {activeStage.title}
          </h3>
          <p className="text-xs sm:text-base font-serif italic text-white/90 leading-relaxed font-light">
            "{activeStage.guidance}"
          </p>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-[#DAE7DE]/80">
            <span className="truncate max-w-[200px] sm:max-w-xs">{t.mantraLabel}: "{session.mantra}"</span>
            <button
              onClick={() => setShowScriptDrawer(!showScriptDrawer)}
              className="text-[#F1E8D7] hover:underline font-medium shrink-0 ms-2"
            >
              {showScriptDrawer ? t.hideScript : t.viewScript}
            </button>
          </div>
        </div>

        {resolveAudioSource(session) ? (
          <div className="w-full max-w-lg flex flex-wrap items-center justify-between gap-2.5 p-3 px-4 rounded-2xl bg-[#123F40]/85 backdrop-blur-md border border-white/20 text-xs text-white shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                {isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DAE7DE] opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full size-2.5 bg-[#F1E8D7]"></span>
              </span>
              <span className="font-medium text-[#F1E8D7]">
                Voice: {voiceChoice || session.audioVoice || 'Kore'}
              </span>
              <span className="text-white/60 text-[11px] hidden sm:inline font-mono">
                • Meditation Sanctuary Narration
              </span>
            </div>
            <button
              onClick={() => setShowMixerDrawer(true)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors border border-white/15 flex items-center gap-1.5"
            >
              <Radio className="size-3 text-[#DAE7DE]" />
              <span>Voice & Effects</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 px-5 rounded-2xl bg-[#123F40]/90 backdrop-blur-md border border-white/20 text-xs text-white shadow-xl">
            <div className="flex items-center gap-2 text-center sm:text-start">
              <Sparkles className="size-4 text-[#F1E8D7] shrink-0 animate-pulse" />
              <span>Therapist voiceover with acoustic reverb & felt piano</span>
            </div>
            <button
              onClick={() => handleGenerateVoiceover()}
              disabled={isRegeneratingAudio}
              className="min-h-9 px-4 rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] font-semibold text-xs transition-colors shrink-0 shadow-sm flex items-center gap-2"
            >
              {isRegeneratingAudio ? (
                <>
                  <div className="size-3.5 border-2 border-[#123F40] border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Music className="size-3.5" />
                  <span>Generate Audio & Piano</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="p-8 sm:p-10 rounded-[2rem] bg-[#123F40] text-white border border-white/20 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="size-14 rounded-full bg-white/15 text-[#F1E8D7] flex items-center justify-center mx-auto border border-white/20">
              <Heart className="size-7 stroke-[2] fill-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-semibold rtl:font-sans">{t.sessionComplete}</h3>
              <p className="text-xs text-[#DAE7DE] font-light leading-relaxed">
                {t.completionBody}
              </p>
            </div>
            <blockquote className="border-s-2 border-[#F1E8D7] ps-3.5 py-1 text-xs italic font-serif text-[#F1E8D7] text-start bg-black/20 rounded-e-lg">
              "{session.mantra}"
            </blockquote>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsCompleted(false);
                  togglePlayPause();
                }}
                className="flex-1 min-h-11 py-2 text-xs rounded-full border border-white/30 text-white hover:bg-white/10 font-semibold"
              >
                {t.repeatSession}
              </button>
              <button
                onClick={onClose}
                className="flex-1 min-h-11 py-2 text-xs rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] font-bold shadow-md"
              >
                {t.returnHome}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sanctuary Mixer Drawer */}
      {showMixerDrawer && (
        <div className="fixed sm:absolute inset-x-3 bottom-24 sm:inset-x-auto sm:end-6 sm:bottom-24 z-40 w-auto sm:w-84 max-w-[calc(100vw-1.5rem)] p-5 sm:p-6 rounded-2xl bg-[#123F40]/95 backdrop-blur-xl border border-white/20 shadow-2xl text-white space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <span className="font-mono text-xs uppercase tracking-wider text-[#DAE7DE] font-semibold">
              {t.soundscapeMixer}
            </span>
            <button onClick={() => setShowMixerDrawer(false)} className="text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
          </div>

          {/* Therapist Voice FX Chain */}
          <div className="space-y-2 p-3 rounded-xl bg-black/25 border border-white/10">
            <div className="flex items-center justify-between text-[#F1E8D7] font-semibold">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Radio className="size-3.5" /> Therapist Vocal FX
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setEnableWarmth(!enableWarmth)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  enableWarmth
                    ? 'bg-[#175C62] border-[#DAE7DE]/50 text-white font-medium'
                    : 'border-white/15 text-white/60'
                }`}
              >
                Warmth EQ (+3dB)
              </button>
              <button
                type="button"
                onClick={() => setEnableReverb(!enableReverb)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                  enableReverb
                    ? 'bg-[#175C62] border-[#DAE7DE]/50 text-white font-medium'
                    : 'border-white/15 text-white/60'
                }`}
              >
                Sanctuary Reverb
              </button>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const nextPiano = !enablePiano;
                  setEnablePiano(nextPiano);
                  if (nextPiano && currentSoundscape === 'none') {
                    setCurrentSoundscape('calm_piano');
                    if (isPlaying) soundscapeEngine.play('calm_piano', ambientVolume);
                  }
                }}
                className={`w-full py-1.5 px-2.5 rounded-lg border text-center transition-colors flex items-center justify-center gap-1.5 ${
                  enablePiano
                    ? 'bg-[#F1E8D7] text-[#123F40] font-semibold border-white'
                    : 'border-white/15 text-white/60'
                }`}
              >
                <Music className="size-3" /> Felt Piano Accompaniment
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#DAE7DE]">
              <span>{t.voiceVolume}</span>
              <span className="font-mono">{Math.round(voiceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full accent-[#F1E8D7]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#DAE7DE]">
              <span>{t.soundscapeVolume}</span>
              <span className="font-mono">{Math.round(ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
              className="w-full accent-[#F1E8D7]"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[#DAE7DE] block font-mono text-[10px]">{t.ambientTrack}</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'calm_piano', name: '🎹 Felt Piano' },
                { id: 'tibetan_bowls', name: 'Tibetan Bowls' },
                { id: 'ocean_waves', name: 'Ocean Waves' },
                { id: 'forest_rain', name: 'Forest Rain' },
                { id: 'binaural_theta', name: 'Binaural Theta' },
                { id: 'zen_windchimes', name: 'Windchimes' },
                { id: 'none', name: 'Mute' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSoundscapeChange(s.id as SoundscapeType)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                    currentSoundscape === s.id
                      ? 'bg-white text-[#123F40] font-semibold border-white'
                      : 'border-white/20 text-white/80 hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/15 space-y-2">
            <div className="flex items-center justify-between text-[#DAE7DE]">
              <span className="font-mono text-[10px] uppercase tracking-wider">🎙️ Voice Persona:</span>
              <span className="text-[10px] text-[#F1E8D7] font-semibold">{voiceChoice}</span>
            </div>
            <div className="space-y-1.5">
              {[
                { id: 'Kore', name: 'Maya', style: 'Warm Soothing Therapist (Female)', tag: 'Recommended' },
                { id: 'Zephyr', name: 'Kai', style: 'Calm & Grounded Presence (Male)', tag: 'Centering' },
                { id: 'Fenrir', name: 'Fenrir', style: 'Deep Resonant Zen Guide (Monk)', tag: 'Deep Rest' },
                { id: 'Puck', name: 'Puck', style: 'Gentle Mindful Whisper (Light)', tag: 'Gentle' },
                { id: 'Charon', name: 'Charon', style: 'Steady Meditative Anchor (Deep)', tag: 'Grounded' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setVoiceChoice(v.id as any);
                    handleGenerateVoiceover(v.id as any);
                  }}
                  disabled={isRegeneratingAudio}
                  className={`w-full p-2 rounded-xl border text-start transition-all flex items-center justify-between ${
                    voiceChoice === v.id
                      ? 'bg-white/20 border-[#F1E8D7] text-white shadow-sm'
                      : 'border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      <span>{v.name}</span>
                      <span className="text-[10px] text-[#DAE7DE]/70 font-mono">({v.id})</span>
                    </div>
                    <div className="text-[10px] text-white/60">{v.style}</div>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-mono shrink-0 ms-2 ${
                      voiceChoice === v.id
                        ? 'bg-[#F1E8D7] text-[#123F40] font-bold'
                        : 'bg-black/30 text-white/60'
                    }`}
                  >
                    {isRegeneratingAudio && voiceChoice === v.id ? 'Loading...' : v.tag}
                  </span>
                </button>
              ))}
            </div>

            {/* Pacing Speed Controls */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[#DAE7DE] block font-mono text-[10px]">Pacing & Cadence:</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: '0.75x Deep', val: 0.75 },
                  { label: '0.88x Gentle', val: 0.88 },
                  { label: '1.0x Normal', val: 1.0 },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => {
                      setPlaybackRate(p.val);
                      if (audioElementRef.current) audioElementRef.current.playbackRate = p.val;
                    }}
                    className={`py-1 text-[10px] rounded border transition-colors ${
                      playbackRate === p.val
                        ? 'bg-white text-[#123F40] font-semibold border-white'
                        : 'border-white/15 text-white/70 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <span className="text-[#DAE7DE] block font-mono text-[10px]">Refresh Artwork:</span>
            <div className="grid grid-cols-3 gap-1">
              {(['1K', '2K', '4K'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleGenerateNewImage(sz)}
                  disabled={isRegeneratingImage}
                  className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                    imageSizeChoice === sz
                      ? 'bg-white text-[#123F40] font-semibold border-white'
                      : 'border-white/20 text-white/80 hover:text-white'
                  }`}
                >
                  {isRegeneratingImage && imageSizeChoice === sz ? '...' : sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Script Drawer */}
      {showScriptDrawer && (
        <div className="fixed sm:absolute inset-x-3 top-16 bottom-24 sm:inset-x-auto sm:end-6 sm:top-20 sm:bottom-24 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] z-40 p-5 sm:p-6 rounded-2xl bg-[#123F40]/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-y-auto space-y-4 text-xs text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <span className="font-mono uppercase tracking-wider text-[#DAE7DE] text-[11px] font-semibold">
              {t.scriptLabel}
            </span>
            <button onClick={() => setShowScriptDrawer(false)} className="text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-3 font-serif">
            {session.stages.map((stg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-colors text-start ${
                  i === currentStageIndex
                    ? 'border-white/40 bg-white/15 text-white'
                    : 'border-white/10 text-white/70'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-[#DAE7DE] uppercase mb-1">
                  <span>{stg.title}</span>
                  <span>{stg.time}</span>
                </div>
                <p className="text-xs leading-relaxed italic">"{stg.guidance}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-6 py-2.5 sm:py-5 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-white/80">
            <span className="tabular-nums text-[10px] sm:text-xs shrink-0">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 300}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F1E8D7]"
            />
            <span className="tabular-nums text-[10px] sm:text-xs shrink-0">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Speed Pills */}
            <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px]">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-colors ${
                    playbackRate === rate
                      ? 'bg-white text-[#123F40] font-bold border-white'
                      : 'border-white/20 text-white/70 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Main Play/Pause Pill Control */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="size-8 sm:size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="size-3.5 sm:size-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="size-11 sm:size-14 rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] flex items-center justify-center transition-all shadow-xl transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="size-5 sm:size-6 fill-[#123F40]" /> : <Play className="size-5 sm:size-6 fill-[#123F40] ms-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                className="size-8 sm:size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Forward 10s"
              >
                <RotateCcw className="size-3.5 sm:size-4 transform scale-x-[-1]" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 text-xs text-[#DAE7DE]">
              <Headphones className="size-3.5 sm:size-4 text-[#F1E8D7]" />
              <span className="hidden sm:inline capitalize font-mono text-[11px] truncate max-w-[100px]">
                {currentSoundscape.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
