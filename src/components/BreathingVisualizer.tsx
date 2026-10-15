import React, { useState, useEffect } from 'react';
import { BreathingPattern } from '../types/meditation';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Locale, TRANSLATIONS } from '../utils/i18n';

interface BreathingVisualizerProps {
  pattern?: BreathingPattern;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale' | 'pause') => void;
  compact?: boolean;
  currentLocale?: Locale;
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
        return 'scale-120 opacity-100 transition-all duration-[4000ms] ease-out';
      case 'hold':
        return 'scale-120 opacity-90 transition-all duration-300';
      case 'exhale':
        return 'scale-90 opacity-75 transition-all duration-[4000ms] ease-in-out';
      case 'pause':
        return 'scale-90 opacity-60 transition-all duration-300';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white/95 border border-[#BCD0C8] px-4 py-2.5 rounded-full shadow-md">
        <div className="size-7 rounded-full bg-[#175C62] text-[#DAE7DE] flex items-center justify-center text-xs font-mono font-bold">
          {secondsLeft}
        </div>
        <div className="text-xs text-[#053333] font-semibold">
          {getPhaseInstruction()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-[2rem] bg-white border border-[#BCD0C8]/80 max-w-lg w-full mx-auto space-y-8 shadow-sm">
      {/* Pattern Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#BCD0C8]/60">
        <div className="text-xs font-mono uppercase tracking-widest text-[#175C62] font-semibold">
          {t.pranayamaEyebrow}
        </div>
        <div className="text-xs font-mono text-[#0E3337] tabular-nums font-medium">
          {completedCycles} {t.cyclesCompleted}
        </div>
      </div>

      {/* Preset Techniques Segmented Pills */}
      <div className="grid grid-cols-2 gap-1.5 w-full p-1 bg-[#DAE7DE]/40 rounded-2xl border border-[#BCD0C8]/70">
        {PRESET_PATTERNS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setActivePattern(p);
              setPhase('inhale');
              setSecondsLeft(p.inhale);
              setCompletedCycles(0);
            }}
            className={`px-3 py-2 text-xs rounded-xl transition-colors text-start ${
              activePattern.name === p.name
                ? 'bg-[#175C62] text-white font-medium shadow-xs'
                : 'text-[#1A2F32]/80 hover:text-[#053333]'
            }`}
          >
            {p.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* MindRested Concentric Breathing Mandala */}
      <div className="relative flex items-center justify-center my-4 size-64 sm:size-72">
        {/* Subtle Outer Concentric Whisper Rings */}
        <div className="absolute inset-0 rounded-full border border-[#175C62]/15" />
        <div className="absolute inset-5 rounded-full border border-[#175C62]/20" />
        <div className="absolute inset-10 rounded-full border border-[#175C62]/10" />

        {/* Central Luminous Breath Orb */}
        <div
          className={`relative z-10 size-44 sm:size-48 rounded-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-[#123F40] via-[#175C62] to-[#2E6C72] text-white shadow-2xl ${getScaleClass()}`}
        >
          <span className="text-4xl font-serif tabular-nums drop-shadow font-semibold">
            {secondsLeft}s
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#DAE7DE] mt-1">
            {phase}
          </span>
        </div>
      </div>

      {/* Phase Guidance Instruction */}
      <div className="text-center space-y-1">
        <p className="text-xl sm:text-2xl font-display font-semibold text-[#053333] rtl:font-sans">
          {getPhaseInstruction()}
        </p>
        <p className="text-xs text-[#1A2F32]/80 font-light max-w-xs mx-auto">
          {activePattern.description}
        </p>
      </div>

      {/* Accessible Pill Controls (min 44px height) */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 min-h-11 px-6 py-2.5 rounded-full bg-[#175C62] hover:bg-[#123F40] text-white font-semibold text-xs tracking-wide transition-all shadow-sm"
        >
          {isActive ? <Pause className="size-3.5 fill-white" /> : <Play className="size-3.5 fill-white" />}
          <span>{isActive ? t.pauseRhythm : t.resumeRhythm}</span>
        </button>

        <button
          onClick={() => {
            setPhase('inhale');
            setSecondsLeft(activePattern.inhale);
            setCompletedCycles(0);
          }}
          className="size-11 rounded-full border border-[#BCD0C8] text-[#175C62] hover:bg-[#FCF2E8] flex items-center justify-center transition-colors"
          title="Reset counter"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
    </div>
  );
};
