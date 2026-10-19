import React, { useState } from 'react';
import {
  Play,
  Heart,
  Search,
  Plus,
  Trash2,
  Volume2,
} from 'lucide-react';
import { MeditationSession } from '../types/meditation';
import { HERO_IMAGE } from '../data/defaultSessions';
import { Locale, TRANSLATIONS } from '../utils/i18n';
import { resolveSessionImageUrl, MEDITATION_IMAGES } from '../assets/images';

interface SanctuaryLibraryProps {
  sessions: MeditationSession[];
  onPlaySession: (session: MeditationSession) => void;
  onOpenCreator: () => void;
  onOpenChat: () => void;
  onToggleFavorite: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  currentLocale: Locale;
}

export const SanctuaryLibrary: React.FC<SanctuaryLibraryProps> = ({
  sessions,
  onPlaySession,
  onOpenCreator,
  onOpenChat,
  onToggleFavorite,
  onDeleteSession,
  currentLocale,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const t = TRANSLATIONS[currentLocale];

  const filterOptions = [
    { id: 'All', label: t.filterAll },
    { id: 'Favorites', label: t.filterSaved },
    { id: 'Sleep', label: t.filterSleep },
    { id: 'Anxiety', label: t.filterAnxiety },
    { id: 'Focus', label: t.filterFocus },
    { id: 'Compassion', label: t.filterCompassion },
    { id: 'Custom', label: t.filterCustom },
  ];

  const filteredSessions = sessions.filter((s) => {
    if (selectedFilter === 'Favorites' && !s.isFavorite) return false;
    if (selectedFilter === 'Sleep' && !s.theme.toLowerCase().includes('sleep')) return false;
    if (
      selectedFilter === 'Anxiety' &&
      !s.theme.toLowerCase().includes('anxiety') &&
      !s.theme.toLowerCase().includes('stress')
    )
      return false;
    if (selectedFilter === 'Focus' && !s.theme.toLowerCase().includes('focus') && !s.theme.toLowerCase().includes('clarity'))
      return false;
    if (
      selectedFilter === 'Compassion' &&
      !s.theme.toLowerCase().includes('compassion') &&
      !s.theme.toLowerCase().includes('metta')
    )
      return false;
    if (selectedFilter === 'Custom' && !s.id.startsWith('custom-')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.theme.toLowerCase().includes(q) ||
        s.mantra.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* MindRested Signature Feature Banner: Deep Botanical Teal (#123F40) with Concentric Rings */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#123F40] text-white shadow-md p-6 sm:p-10 lg:p-12">
        {/* Signature MindRested Concentric Whisper Rings */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 -top-20 size-80 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-2 -top-7 size-56 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-28 -top-28 h-96 w-96 rounded-full bg-[#FCF2E8]/10 blur-3xl"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Typographic Manifesto */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-[#DAE7DE] rtl:tracking-normal">
                {t.heroEyebrow}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white rtl:font-sans rtl:leading-relaxed">
                {t.heroHeadline}
              </h1>

              <p className="text-sm sm:text-base leading-7 text-white/85 max-w-xl font-light">
                {t.heroDescription}
              </p>
            </div>

            {/* MindRested Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCreator}
                className="flex items-center gap-2 min-h-12 px-6 py-3 rounded-full bg-[#F1E8D7] hover:bg-white text-[#123F40] font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.heroCreateBtn}</span>
              </button>

              <button
                onClick={onOpenChat}
                className="flex items-center gap-2 min-h-12 px-6 py-3 rounded-full border border-white/30 hover:border-white text-white hover:bg-white/10 text-xs sm:text-sm font-semibold transition-all"
              >
                <span>{t.heroGuideBtn}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Architectural Pavilion Frame */}
          <div className="lg:col-span-5 relative rounded-[1.5rem] overflow-hidden bg-black/30 border border-white/15 shadow-inner aspect-[4/3] lg:aspect-auto lg:h-76">
            <img
              src={HERO_IMAGE}
              alt={t.heroPavilionCaption}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = MEDITATION_IMAGES.hero;
              }}
              className="w-full h-full object-cover filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 start-4 text-xs font-serif italic text-white/90 drop-shadow">
              {t.heroPavilionCaption}
            </div>
          </div>
        </div>
      </section>

      {/* Operational Utility Ribbon (Clinical Rigor & Tabular Numbers) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-6 rounded-2xl bg-[#DAE7DE]/30 border border-[#BCD0C8]/60 text-xs">
        <div className="space-y-1 text-start">
          <div className="text-[#175C62] font-mono text-[10px] uppercase tracking-wider">
            {t.kpiPracticeTime}
          </div>
          <div className="text-sm sm:text-base font-semibold text-[#053333] tabular-nums">
            {t.kpiUnitMinutes}
          </div>
        </div>

        <div className="space-y-1 text-start">
          <div className="text-[#175C62] font-mono text-[10px] uppercase tracking-wider">
            {t.kpiStreak}
          </div>
          <div className="text-sm sm:text-base font-semibold text-[#053333] tabular-nums">
            {t.kpiUnitDays}
          </div>
        </div>

        <div className="space-y-1 text-start">
          <div className="text-[#175C62] font-mono text-[10px] uppercase tracking-wider">
            {t.kpiSanctuarySize}
          </div>
          <div className="text-sm sm:text-base font-semibold text-[#053333] tabular-nums">
            {sessions.length} {t.kpiUnitSessions}
          </div>
        </div>

        <div className="space-y-1 text-start">
          <div className="text-[#175C62] font-mono text-[10px] uppercase tracking-wider">
            {t.kpiTtsEngine}
          </div>
          <div className="text-sm sm:text-base font-semibold text-[#175C62]">
            Sanctuary Neural Voice
          </div>
        </div>
      </section>

      {/* Segmented Filter Pills & Search */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Segmented Filter Pills (Zero-Pill Discipline on static text, clean functional button tabs) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#DAE7DE]/40 border border-[#BCD0C8]/70 rounded-full overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`min-h-9 px-4 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 ${
                selectedFilter === opt.id
                  ? 'bg-[#175C62] text-white shadow-xs'
                  : 'text-[#1A2F32]/80 hover:text-[#053333] hover:bg-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Quiet Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#175C62]/60 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-10 pe-4 py-2.5 min-h-11 bg-white border border-[#BCD0C8] rounded-full text-xs text-[#053333] placeholder-[#175C62]/50 focus:outline-none focus:border-[#175C62] transition-colors shadow-xs"
          />
        </div>
      </section>

      {/* Catalog Cards: MindRested Elevated Interactive Directory Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {filteredSessions.map((session) => (
          <article
            key={session.id}
            className="group relative flex flex-col rounded-[1.5rem] border border-[#BCD0C8]/80 bg-white hover:border-[#175C62]/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            {/* Visual Frame */}
            <div
              onClick={() => onPlaySession(session)}
              className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900 cursor-pointer"
            >
              <img
                src={resolveSessionImageUrl(session.imageUrl, `${session.title} ${session.theme}`)}
                alt={session.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = resolveSessionImageUrl(undefined, `${session.title} ${session.theme}`);
                }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Top Controls: Favorite & Delete */}
              <div className="absolute top-3 end-3 sm:top-3.5 sm:end-3.5 flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleFavorite(session.id)}
                  aria-label="Save to favorites"
                  className={`size-9 sm:size-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm flex items-center justify-center transition-colors ${
                    session.isFavorite ? 'text-rose-500' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Heart className={`size-4 ${session.isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                {session.id.startsWith('custom-') && (
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    aria-label="Delete session"
                    className="size-9 sm:size-10 rounded-full bg-white/90 backdrop-blur-md border border-stone-200 shadow-sm flex items-center justify-center text-stone-600 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              {/* Play Button Overlay (Visible on mobile, revealed on hover on desktop) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black/25 backdrop-blur-[1px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySession(session);
                  }}
                  className="flex items-center gap-2 min-h-10 sm:min-h-11 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#175C62] hover:bg-[#123F40] text-[#DAE7DE] font-semibold text-xs tracking-wide shadow-xl transition-transform transform scale-95 sm:group-hover:scale-100"
                >
                  <Play className="size-3.5 fill-[#DAE7DE]" />
                  <span>Therapist & Piano</span>
                </button>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                {/* Unboxed Metadata (Zero-Pill Discipline) */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#175C62] uppercase tracking-wider">
                  <span>{session.theme}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.durationMinutes} {t.minLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.imageSize || '2K'} {t.artLabel}</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-[#053333] group-hover:text-[#175C62] transition-colors rtl:font-sans">
                  {session.title}
                </h3>

                <p className="text-sm text-[#1A2F32]/80 leading-relaxed font-normal line-clamp-2">
                  {session.subtitle}
                </p>
              </div>

              {/* Mantra Pull-Quote */}
              <blockquote className="border-s-2 border-[#175C62]/40 ps-3.5 py-1 text-xs italic font-serif text-[#0E3337] bg-[#FCF2E8]/40 rounded-e-lg">
                "{session.mantra}"
              </blockquote>

              {/* Footer Audio Bar: Clean Unboxed Metadata & Action */}
              <div className="pt-3 border-t border-[#BCD0C8]/60 flex items-center justify-between text-xs text-[#1A2F32]/80">
                <div className="flex items-center gap-2 text-[11px] font-medium">
                  <Volume2 className="size-3.5 text-[#175C62]" />
                  <span>Therapist {session.audioVoice || 'Kore'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{session.soundscape === 'calm_piano' ? '🎹 Felt Piano' : session.soundscape.replace('_', ' ')}</span>
                </div>

                <button
                  onClick={() => onPlaySession(session)}
                  className="font-semibold text-xs text-[#175C62] hover:text-[#053333] transition-colors"
                >
                  {t.playAction}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredSessions.length === 0 && (
        <div className="py-20 text-center space-y-4 border-2 border-dashed border-[#BCD0C8] rounded-2xl bg-white/50">
          <p className="text-sm font-serif text-[#1A2F32]/80">{t.emptyFilterMsg}</p>
          <button
            onClick={onOpenCreator}
            className="min-h-11 px-6 py-2.5 rounded-full bg-[#175C62] hover:bg-[#123F40] text-white text-xs font-semibold shadow-sm"
          >
            {t.heroCreateBtn}
          </button>
        </div>
      )}
    </div>
  );
};
