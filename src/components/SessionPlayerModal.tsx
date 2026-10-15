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
} from 'lucide-react';
import { MeditationSession, SoundscapeType } from '../types/meditation';
import { soundscapeEngine } from '../utils/audioSynthesizer';
import { BreathingVisualizer } from './BreathingVisualizer';
import { Locale, TRANSLATIONS } from '../utils/i18n';

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

  useEffect(() => {
    if (!isOpen) {
      soundscapeEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const targetSeconds = session.durationMinutes * 60;
    setDuration(targetSeconds);
    setCurrentTime(0);
    setIsCompleted(false);

    if (session.audioBase64) {
      if (!audioElementRef.current) audioElementRef.current = new Audio();
      audioElementRef.current.src = `data:audio/wav;base64,${session.audioBase64}`;
      audioElementRef.current.volume = voiceVolume;
      audioElementRef.current.playbackRate = playbackRate;

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
    }

    return () => {
      soundscapeEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
    };
  }, [isOpen, session.id]);

  useEffect(() => {
    soundscapeEngine.setVolume(ambientVolume);
  }, [ambientVolume]);

  useEffect(() => {
    if (audioElementRef.current) audioElementRef.current.volume = voiceVolume;
  }, [voiceVolume]);

  useEffect(() => {
    if (audioElementRef.current) audioElementRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = window.setInterval(() => {
        if (audioElementRef.current && session.audioBase64) {
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
  }, [isPlaying, duration, session.audioBase64]);

  const togglePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (nextState) {
      if (isCompleted) {
        setCurrentTime(0);
        setIsCompleted(false);
      }
      if (currentSoundscape !== 'none') soundscapeEngine.play(currentSoundscape, ambientVolume);
      if (audioElementRef.current && session.audioBase64) audioElementRef.current.play().catch(console.warn);
    } else {
      soundscapeEngine.stop();
      if (audioElementRef.current) audioElementRef.current.pause();
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioElementRef.current && session.audioBase64) {
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
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: session.fullScript || session.stages.map((s) => s.guidance).join(' <breath> '),
          voiceName: chosenVoice,
          style: session.audioStyle || 'Slow, deeply calming, warm meditation guide',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'TTS failed');

      const updatedSession: MeditationSession = {
        ...session,
        audioBase64: data.audioBase64,
        audioVoice: chosenVoice,
      };

      if (audioElementRef.current) {
        audioElementRef.current.src = `data:audio/wav;base64,${data.audioBase64}`;
        if (isPlaying) audioElementRef.current.play();
      }

      if (onUpdateSession) onUpdateSession(updatedSession);
    } catch (err: any) {
      console.error('TTS error:', err);
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
        {session.imageUrl ? (
          <img
            src={session.imageUrl}
            alt={session.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-[30000ms] ease-out ${
              isPlaying ? 'scale-110 filter brightness-75' : 'scale-100 filter brightness-65'
            }`}
          />
        ) : (
          <div className="w-full h-full bg-[#123F40]" />
        )}
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
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="size-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
            title="Exit Session"
          >
            <ChevronLeft className="size-5 rtl:-scale-x-100" />
          </button>
          <div className="text-start">
            <h2 className="text-xl font-display font-semibold text-white drop-shadow rtl:font-sans">
              {session.title}
            </h2>
            <div className="text-xs font-mono text-[#DAE7DE] drop-shadow flex items-center gap-2">
              <span>{session.theme}</span>
              <span aria-hidden="true">·</span>
              <span>{session.imageSize || '2K'} {t.artLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{session.audioVoice || 'Kore'} {t.voiceLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle Breathing Circle */}
          <button
            onClick={() => setShowBreathingCircle(!showBreathingCircle)}
            className={`size-11 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors ${
              showBreathingCircle
                ? 'bg-[#175C62] border-white/30 text-white'
                : 'bg-black/40 border-white/20 text-white/70 hover:text-white'
            }`}
            title="Toggle Breathing Guide"
          >
            <Wind className="size-4" />
          </button>

          {/* Sound & Voice Settings */}
          <button
            onClick={() => setShowMixerDrawer(!showMixerDrawer)}
            className={`size-11 rounded-full border backdrop-blur-md flex items-center justify-center transition-colors ${
              showMixerDrawer
                ? 'bg-[#175C62] border-white/30 text-white'
                : 'bg-black/40 border-white/20 text-white/70 hover:text-white'
            }`}
            title="Soundscape & Mixer"
          >
            <Sliders className="size-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="size-11 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <button
            onClick={onClose}
            className="size-11 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Center Stage & Teleprompter */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto px-4 text-center space-y-6">
        {showBreathingCircle && (
          <div className="transform scale-95 transition-all">
            <BreathingVisualizer
              pattern={session.breathingPattern}
              compact={false}
              currentLocale={currentLocale}
            />
          </div>
        )}

        {/* Teleprompter Card */}
        <div className="max-w-lg p-6 sm:p-7 rounded-[1.5rem] bg-[#123F40]/85 backdrop-blur-xl border border-white/15 text-white shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-[#DAE7DE] uppercase tracking-widest pb-2 border-b border-white/10">
            <span>
              {t.stageLabel} {currentStageIndex + 1} {t.ofLabel} {session.stages.length}
            </span>
            <span>{activeStage.time}</span>
          </div>

          <h3 className="text-lg font-display font-semibold text-white rtl:font-sans">
            {activeStage.title}
          </h3>
          <p className="text-sm sm:text-base font-serif italic text-white/90 leading-relaxed font-light">
            "{activeStage.guidance}"
          </p>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#DAE7DE]/80">
            <span>{t.mantraLabel}: "{session.mantra}"</span>
            <button
              onClick={() => setShowScriptDrawer(!showScriptDrawer)}
              className="text-[#F1E8D7] hover:underline font-medium"
            >
              {showScriptDrawer ? t.hideScript : t.viewScript}
            </button>
          </div>
        </div>

        {!session.audioBase64 && (
          <div className="flex items-center gap-3 p-3.5 rounded-full bg-[#123F40]/90 border border-white/20 text-xs text-white">
            <Sparkles className="size-4 text-[#DAE7DE] shrink-0" />
            <span>Voiceover ready via Gemini 3.8 Flash TTS.</span>
            <button
              onClick={() => handleGenerateVoiceover()}
              disabled={isRegeneratingAudio}
              className="min-h-9 px-4 rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] font-semibold text-xs transition-colors shrink-0"
            >
              {isRegeneratingAudio ? '...' : 'Synthesize Audio'}
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
        <div className="absolute bottom-24 end-6 z-30 w-80 p-6 rounded-2xl bg-[#123F40]/95 backdrop-blur-xl border border-white/20 shadow-2xl text-white space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <span className="font-mono text-xs uppercase tracking-wider text-[#DAE7DE] font-semibold">
              {t.soundscapeMixer}
            </span>
            <button onClick={() => setShowMixerDrawer(false)} className="text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
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
                { id: 'tibetan_bowls', name: 'Bowls' },
                { id: 'ocean_waves', name: 'Surf' },
                { id: 'forest_rain', name: 'Rain' },
                { id: 'binaural_theta', name: 'Theta' },
                { id: 'zen_windchimes', name: 'Chimes' },
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

          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <span className="text-[#DAE7DE] block font-mono text-[10px]">Gemini 3.8 TTS Voice:</span>
            <div className="grid grid-cols-5 gap-1">
              {(['Kore', 'Zephyr', 'Fenrir', 'Puck', 'Charon'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setVoiceChoice(v);
                    handleGenerateVoiceover(v);
                  }}
                  disabled={isRegeneratingAudio}
                  className={`py-1 text-[11px] rounded border transition-colors ${
                    voiceChoice === v
                      ? 'bg-white text-[#123F40] font-semibold border-white'
                      : 'border-white/20 text-white/80 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
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
        <div className="absolute top-20 bottom-24 end-6 w-80 sm:w-96 z-30 p-6 rounded-2xl bg-[#123F40]/95 backdrop-blur-xl border border-white/20 shadow-2xl overflow-y-auto space-y-4 text-xs text-white">
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
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-3 text-xs font-mono text-white/80">
            <span className="tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 300}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F1E8D7]"
            />
            <span className="tabular-nums">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Speed Pills */}
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2.5 py-1 rounded-full border transition-colors ${
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Rewind 10s"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="size-14 rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] flex items-center justify-center transition-all shadow-xl transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause className="size-6 fill-[#123F40]" /> : <Play className="size-6 fill-[#123F40] ms-0.5" />}
              </button>

              <button
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                className="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Forward 10s"
              >
                <RotateCcw className="size-4 transform scale-x-[-1]" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#DAE7DE]">
              <Headphones className="size-4 text-[#F1E8D7]" />
              <span className="hidden sm:inline capitalize font-mono text-[11px]">
                {currentSoundscape.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
