/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SanctuaryLibrary } from './components/SanctuaryLibrary';
import { CustomSessionCreator } from './components/CustomSessionCreator';
import { SessionPlayerModal } from './components/SessionPlayerModal';
import { ChatGuideModal } from './components/ChatGuideModal';
import { BreathingVisualizer } from './components/BreathingVisualizer';
import { DEFAULT_SESSIONS } from './data/defaultSessions';
import { MeditationSession } from './types/meditation';
import { Locale, TRANSLATIONS } from './utils/i18n';

const STORAGE_KEY = 'mindrested_sessions_v1';
const LOCALE_KEY = 'mindrested_locale_v1';

export default function App() {
  const [sessions, setSessions] = useState<MeditationSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved sessions from localStorage:', e);
    }
    return DEFAULT_SESSIONS;
  });

  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(LOCALE_KEY);
      if (saved && ['en', 'fr', 'ar'].includes(saved)) {
        return saved as Locale;
      }
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  const [activeTab, setActiveTab] = useState<'library' | 'creator' | 'breathing'>('library');
  const [activePlayingSession, setActivePlayingSession] = useState<MeditationSession | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // States passed from Chat into Creator
  const [creatorTopic, setCreatorTopic] = useState<string>('');
  const [creatorPromptDetails, setCreatorPromptDetails] = useState<string>('');

  const t = TRANSLATIONS[currentLocale];

  // Dynamic RTL and Language attribute management
  useEffect(() => {
    if (currentLocale === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLocale;
    }
    try {
      localStorage.setItem(LOCALE_KEY, currentLocale);
    } catch (e) {
      // ignore
    }
  }, [currentLocale]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  const handlePlaySession = (session: MeditationSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, playsCount: (s.playsCount || 0) + 1 } : s))
    );
    setActivePlayingSession(session);
  };

  const handleSessionCreated = (newSession: MeditationSession, startImmediately: boolean = false) => {
    setSessions((prev) => [newSession, ...prev]);
    setActiveTab('library');
    if (startImmediately) {
      setActivePlayingSession(newSession);
    }
  };

  const handleToggleFavorite = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Remove this guided session from your sanctuary?')) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleUpdateSessionInPlayer = (updatedSession: MeditationSession) => {
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
    setActivePlayingSession(updatedSession);
  };

  const handleCraftMeditationFromTopic = (topic: string, details: string) => {
    setCreatorTopic(topic);
    setCreatorPromptDetails(details);
    setActiveTab('creator');
  };

  return (
    <div className="min-h-screen bg-[#FCFCF8] text-[#1A2F32] flex flex-col font-sans selection:bg-[#DAE7DE] selection:text-[#175C62] transition-colors">
      {/* MindRested 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
        currentLocale={currentLocale}
        onLocaleChange={(loc) => setCurrentLocale(loc)}
      />

      {/* Main Sanctuary Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 pb-20">
        {activeTab === 'library' && (
          <SanctuaryLibrary
            sessions={sessions}
            onPlaySession={handlePlaySession}
            onOpenCreator={() => {
              setCreatorTopic('');
              setCreatorPromptDetails('');
              setActiveTab('creator');
            }}
            onOpenChat={() => setIsChatOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onDeleteSession={handleDeleteSession}
            currentLocale={currentLocale}
          />
        )}

        {activeTab === 'creator' && (
          <CustomSessionCreator
            onSessionCreated={handleSessionCreated}
            initialTopic={creatorTopic}
            initialPromptDetails={creatorPromptDetails}
            onCancel={() => setActiveTab('library')}
            currentLocale={currentLocale}
          />
        )}

        {activeTab === 'breathing' && (
          <div className="py-8 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#175C62] font-semibold">
                {t.pranayamaEyebrow}
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#053333] rtl:font-sans">
                {t.pranayamaTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#1A2F32]/80 max-w-md mx-auto font-light leading-relaxed">
                {t.pranayamaSubtitle}
              </p>
            </div>

            <BreathingVisualizer compact={false} currentLocale={currentLocale} />
          </div>
        )}
      </main>

      {/* MindRested Calm Clinical Footer */}
      <footer className="border-t border-[#BCD0C8]/60 bg-[#FCFCF8] py-8 px-6 text-xs text-[#1A2F32]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm tracking-tight text-[#053333]">
              {t.brandName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.brandTagline}</span>
            <span aria-hidden="true">·</span>
            <span>From 450 MAD · Online</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-[#175C62]">
            <span>gemini-3.8-flash-tts</span>
            <span aria-hidden="true">·</span>
            <span>gemini-3-pro-image-preview</span>
            <span aria-hidden="true">·</span>
            <span>gemini-4-argon</span>
          </div>
        </div>
      </footer>

      {/* Fullscreen / Immersive Player Modal */}
      {activePlayingSession && (
        <SessionPlayerModal
          session={activePlayingSession}
          isOpen={Boolean(activePlayingSession)}
          onClose={() => setActivePlayingSession(null)}
          onUpdateSession={handleUpdateSessionInPlayer}
          currentLocale={currentLocale}
        />
      )}

      {/* Multi-Turn Chat Guide Modal */}
      <ChatGuideModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onCraftMeditationFromTopic={handleCraftMeditationFromTopic}
        currentLocale={currentLocale}
      />
    </div>
  );
}
