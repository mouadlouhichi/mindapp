import React, { useState, useEffect } from 'react';
import { BreathingPattern } from '../types/meditation';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Locale, TRANSLATIONS } from '../utils/i18n';

interface BreathingVisualizerProps {
  pattern?: BreathingPattern;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'pause') => void;
  compact?: boolean;
  currentLocale?: Locale;
  theme?: 'light' | 'dark';
}

export const PRESET_PATTERNS: BreathingPattern[] = [
  {
    name: 'Box Breathing (4-4-4-4)',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    description: 'Stabilizes autonomic arousal and restores sharp, grounded equilibrium.',
  },
  {
    name: '4-7-8 Deep Sleep',
    inhale: 4,
    hold: 7,
    exhale: 8,
    pause: 1,
    description: 'Activates vagal tone and slows cardiac rhythm for restorative rest.',
  },
  {
    name: 'Heart Coherence (5-5)',
    inhale: 5,
    hold: 0,
    exhale: 5,
    pause: 0,
    description: 'Synchronizes cardiac and neural rhythms at 0.1Hz resonance.',
  },
  {
    name: 'Calming Balance (4-6)',
    inhale: 4,
    hold: 2,
    exhale: 6,
    pause: 2,
    description: 'Extended exhalations that naturally stimulate parasympathetic relaxation.',
  },
];

export const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({
  pattern: initialPattern,
  onPhaseChange,
  compact = false,
  currentLocale = 'en',
  theme = 'light',
}) => {
  const [activePattern, setActivePattern] = useState<BreathingPattern>(
    initialPattern || PRESET_PATTERNS[0]
  );
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(activePattern.inhale);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const t = TRANSLATIONS[currentLocale];

  useEffect(() => {
    if (initialPattern) {
      setActivePattern(initialPattern);
      setSecondsLeft(initialPattern.inhale);
      setPhase('inhale');
    }
  }, [initialPattern]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        let nextPhase: 'inhale' | 'hold' | 'exhale' | 'pause' = 'inhale';
        let nextDuration = activePattern.inhale;

        if (phase === 'inhale') {
          if (activePattern.hold > 0) {
            nextPhase = 'hold';
            nextDuration = activePattern.hold;
          } else {
            nextPhase = 'exhale';
            nextDuration = activePattern.exhale;
          }
        } else if (phase === 'hold') {
          nextPhase = 'exhale';
          nextDuration = activePattern.exhale;
        } else if (phase === 'exhale') {
          if (activePattern.pause > 0) {
            nextPhase = 'pause';
            nextDuration = activePattern.pause;
          } else {
            nextPhase = 'inhale';
            nextDuration = activePattern.inhale;
            setCompletedCycles((c) => c + 1);
          }
        } else if (phase === 'pause') {
          nextPhase = 'inhale';
          nextDuration = activePattern.inhale;
          setCompletedCycles((c) => c + 1);
        }

        setPhase(nextPhase);
        if (onPhaseChange) onPhaseChange(nextPhase);
        return nextDuration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, activePattern, onPhaseChange]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return t.phaseInhale;
      case 'hold':
        return t.phaseHold;
      case 'exhale':
        return t.phaseExhale;
      case 'pause':
        return t.phasePause;
    }
  };

  const getScaleClass = () => {
    if (!isActive) return 'scale-90 opacity-70';
    switch (phase) {
      case 'inhale':
        return 'scale-115 opacity-100 transition-all duration-[4000ms] ease-out';
      case 'hold':
        return 'scale-115 opacity-90 transition-all duration-300';
      case 'exhale':
        return 'scale-90 opacity-75 transition-all duration-[4000ms] ease-in-out';
      case 'pause':
        return 'scale-90 opacity-60 transition-all duration-300';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-md border ${
        theme === 'dark'
          ? 'bg-[#123F40]/90 border-white/20 text-white'
          : 'bg-white/95 border-[#BCD0C8] text-[#053333]'
      }`}>
        <div className={`size-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
          theme === 'dark' ? 'bg-[#F1E8D7] text-[#123F40]' : 'bg-[#175C62] text-[#DAE7DE]'
        }`}>
          {secondsLeft}
        </div>
        <div className="text-xs font-semibold">
          {getPhaseInstruction()}
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col items-center justify-center rounded-[2rem] w-full mx-auto transition-all ${
      isDark
        ? 'p-4 sm:p-6 bg-[#123F40]/85 backdrop-blur-xl border border-white/20 max-w-sm sm:max-w-md space-y-4 shadow-2xl text-white'
        : 'p-6 sm:p-10 bg-white border border-[#BCD0C8]/80 max-w-lg space-y-6 sm:space-y-8 shadow-sm text-[#053333]'
    }`}>
      {/* Pattern Header */}
      <div className={`w-full flex items-center justify-between pb-3 border-b ${
        isDark ? 'border-white/15' : 'border-[#BCD0C8]/60'
      }`}>
        <div className={`text-xs font-mono uppercase tracking-widest font-semibold ${
          isDark ? 'text-[#F1E8D7]' : 'text-[#175C62]'
        }`}>
          {t.pranayamaEyebrow}
        </div>
        <div className={`text-xs font-mono tabular-nums font-medium ${
          isDark ? 'text-[#DAE7DE]' : 'text-[#0E3337]'
        }`}>
          {completedCycles} {t.cyclesCompleted}
        </div>
      </div>

      {/* Preset Techniques Segmented Pills */}
      <div className={`grid grid-cols-2 gap-1.5 w-full p-1 rounded-2xl border ${
        isDark ? 'bg-black/30 border-white/10' : 'bg-[#DAE7DE]/40 border-[#BCD0C8]/70'
      }`}>
        {PRESET_PATTERNS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setActivePattern(p);
              setPhase('inhale');
              setSecondsLeft(p.inhale);
              setCompletedCycles(0);
            }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs rounded-xl transition-colors text-start ${
              activePattern.name === p.name
                ? isDark
                  ? 'bg-[#F1E8D7] text-[#123F40] font-bold shadow-xs'
                  : 'bg-[#175C62] text-white font-medium shadow-xs'
                : isDark
                ? 'text-white/70 hover:text-white'
                : 'text-[#1A2F32]/80 hover:text-[#053333]'
            }`}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* MindRested Concentric Breathing Mandala */}
      <div className={`relative flex items-center justify-center ${
        isDark ? 'size-40 sm:size-48 my-1' : 'size-52 sm:size-64 my-3'
      }`}>
        {/* Subtle Outer Concentric Whisper Rings */}
        <div className={`absolute inset-0 rounded-full border ${isDark ? 'border-white/15' : 'border-[#175C62]/15'}`} />
        <div className={`absolute inset-3 sm:inset-4 rounded-full border ${isDark ? 'border-white/10' : 'border-[#175C62]/20'}`} />
        <div className={`absolute inset-6 sm:inset-8 rounded-full border ${isDark ? 'border-white/5' : 'border-[#175C62]/10'}`} />

        {/* Central Luminous Breath Orb */}
        <div
          className={`relative z-10 rounded-full flex flex-col items-center justify-center p-3 text-white shadow-2xl ${
            isDark ? 'size-28 sm:size-34 bg-gradient-to-tr from-[#175C62] via-[#2E6C72] to-[#DAE7DE]/30 border border-white/20' : 'size-36 sm:size-44 bg-gradient-to-tr from-[#123F40] via-[#175C62] to-[#2E6C72]'
          } ${getScaleClass()}`}
        >
          <span className={`font-serif tabular-nums drop-shadow font-semibold ${
            isDark ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
          }`}>
            {secondsLeft}s
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#DAE7DE] mt-0.5">
            {phase}
          </span>
        </div>
      </div>

      {/* Phase Guidance Instruction */}
      <div className="text-center space-y-1">
        <p className={`font-display font-semibold rtl:font-sans ${
          isDark ? 'text-lg sm:text-xl text-[#F1E8D7]' : 'text-xl sm:text-2xl text-[#053333]'
        }`}>
          {getPhaseInstruction()}
        </p>
        <p className={`font-light max-w-xs mx-auto ${
          isDark ? 'text-[11px] sm:text-xs text-[#DAE7DE]/80 leading-snug' : 'text-xs text-[#1A2F32]/80'
        }`}>
          {activePattern.description}
        </p>
      </div>

      {/* Accessible Pill Controls (min 44px height) */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex items-center gap-2 min-h-10 px-5 py-2 rounded-full font-semibold text-xs tracking-wide transition-all shadow-sm ${
            isDark
              ? 'bg-[#F1E8D7] hover:bg-white text-[#123F40]'
              : 'bg-[#175C62] hover:bg-[#123F40] text-white'
          }`}
        >
          {isActive ? <Pause className={`size-3.5 ${isDark ? 'fill-[#123F40]' : 'fill-white'}`} /> : <Play className={`size-3.5 ${isDark ? 'fill-[#123F40]' : 'fill-white'}`} />}
          <span>{isActive ? t.pauseRhythm : t.resumeRhythm}</span>
        </button>

        <button
          onClick={() => {
            setPhase('inhale');
            setSecondsLeft(activePattern.inhale);
            setCompletedCycles(0);
          }}
          className={`size-10 rounded-full border flex items-center justify-center transition-colors ${
            isDark
              ? 'border-white/20 text-[#DAE7DE] hover:bg-white/10 hover:text-white'
              : 'border-[#BCD0C8] text-[#175C62] hover:bg-[#FCF2E8]'
          }`}
          title="Reset counter"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
