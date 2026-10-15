import React, { useState } from 'react';
import { MessageSquare, Globe, Heart } from 'lucide-react';
import { Locale, TRANSLATIONS } from '../utils/i18n';

interface NavbarProps {
  activeTab: 'library' | 'creator' | 'breathing';
  setActiveTab: (tab: 'library' | 'creator' | 'breathing') => void;
  onOpenChat: () => void;
  currentLocale: Locale;
  onLocaleChange: (newLocale: Locale) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  currentLocale,
  onLocaleChange,
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLocale];

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'ar', label: 'العربية', flag: 'AR' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#175C62]/15 bg-[#FCFCF8]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: MindRested Brand Wordmark & Organic Heart Emblem */}
        <button
          onClick={() => setActiveTab('library')}
          className="flex items-center gap-3 text-start shrink-0 group focus:outline-none"
        >
          {/* MindRested Signature Heart Icon Badge */}
          <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#175C62] text-white shadow-sm ring-1 ring-inset ring-[#175C62]/20 group-hover:bg-[#123F40] transition-colors">
            <Heart className="size-5 stroke-[2] fill-white/20" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-[#053333] group-hover:text-[#175C62] transition-colors">
                {t.brandName}
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#175C62]/80 font-mono">
              {t.brandTagline}
            </p>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1A2F32]/80">
          <button
            onClick={() => setActiveTab('library')}
            className={`transition-colors pb-1 border-b-2 text-sm ${
              activeTab === 'library'
                ? 'border-[#175C62] text-[#053333] font-semibold'
                : 'border-transparent hover:text-[#053333]'
            }`}
          >
            {t.navSanctuary}
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`transition-colors pb-1 border-b-2 text-sm ${
              activeTab === 'creator'
                ? 'border-[#175C62] text-[#053333] font-semibold'
                : 'border-transparent hover:text-[#053333]'
            }`}
          >
            {t.navAtelier}
          </button>
          <button
            onClick={() => setActiveTab('breathing')}
            className={`transition-colors pb-1 border-b-2 text-sm ${
              activeTab === 'breathing'
                ? 'border-[#175C62] text-[#053333] font-semibold'
                : 'border-transparent hover:text-[#053333]'
            }`}
          >
            {t.navPranayama}
          </button>
        </nav>

        {/* Zone 3: Language Selector + Primary Pill CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Multilingual Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 min-h-11 px-3.5 rounded-full border border-[#BCD0C8] bg-white hover:bg-[#FCF2E8] text-[#175C62] text-xs font-medium transition-colors shadow-xs"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase font-mono font-semibold">{currentLocale}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute end-0 top-13 z-50 w-36 py-1.5 rounded-2xl bg-white border border-[#BCD0C8] shadow-lg text-xs">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLocaleChange(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-start transition-colors ${
                      currentLocale === lang.code
                        ? 'bg-[#DAE7DE]/50 text-[#175C62] font-semibold'
                        : 'text-[#1A2F32] hover:bg-[#FCF2E8]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="font-mono text-[10px] text-[#175C62]/70 uppercase">
                      {lang.flag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Pill CTA Button (MindRested primary-6000 with 44px min touch target) */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-full bg-[#175C62] hover:bg-[#1A2F32] text-[#DAE7DE] font-semibold text-xs tracking-wide transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{t.navConsultGuide}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dock */}
      <div className="flex md:hidden items-center justify-around py-2 border-t border-[#175C62]/10 bg-[#FCFCF8] text-xs">
        <button
          onClick={() => setActiveTab('library')}
          className={`py-1.5 px-3 rounded-full transition-colors ${
            activeTab === 'library'
              ? 'bg-[#DAE7DE] text-[#175C62] font-semibold'
              : 'text-[#1A2F32]/70'
          }`}
        >
          {t.navSanctuary}
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`py-1.5 px-3 rounded-full transition-colors ${
            activeTab === 'creator'
              ? 'bg-[#DAE7DE] text-[#175C62] font-semibold'
              : 'text-[#1A2F32]/70'
          }`}
        >
          {t.navAtelier}
        </button>
        <button
          onClick={() => setActiveTab('breathing')}
          className={`py-1.5 px-3 rounded-full transition-colors ${
            activeTab === 'breathing'
              ? 'bg-[#DAE7DE] text-[#175C62] font-semibold'
              : 'text-[#1A2F32]/70'
          }`}
        >
          {t.navPranayama}
        </button>
      </div>
    </header>
  );
};
