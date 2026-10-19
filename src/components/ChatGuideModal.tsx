import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Trash2,
  Heart,
} from 'lucide-react';
import { ChatMessage, ChatRole, GeminiModel, RoleConfig } from '../types/meditation';
import { Locale, TRANSLATIONS } from '../utils/i18n';

interface ChatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCraftMeditationFromTopic?: (topic: string, promptDetails: string) => void;
  currentLocale?: Locale;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'zen-master',
    name: 'Zen Master Bodhi',
    title: 'Deep Contemplative Sage',
    model: 'gemini-4-argon',
    tagline: 'Complex existential insight & philosophical inquiry',
    avatar: '🧘‍♂️',
    badgeColor: 'text-amber-700 font-mono',
    description: 'Profound life inquiries, grief, existential dilemmas, and contemplative meditation.',
  },
  {
    id: 'serenity-coach',
    name: 'Serenity Coach Maya',
    title: 'Everyday Mindfulness Guide',
    model: 'gemini-3.8-flash',
    tagline: 'Daily calm, emotional equilibrium & habit building',
    avatar: '🌿',
    badgeColor: 'text-[#175C62] font-mono',
    description: 'Everyday work stress, loving-kindness, body awareness, and evening unwinding.',
  },
  {
    id: 'instant-calmer',
    name: 'Instant Calmer Kai',
    title: 'Rapid Somatic Coach',
    model: 'gemini-3.1-flash-lite',
    tagline: 'Ultra-fast anxiety de-escalation & breath resets',
    avatar: '⚡',
    badgeColor: 'text-sky-700 font-mono',
    description: '30-to-60 second acute panic relief, 5-4-3-2-1 grounding, and somatic resets.',
  },
  {
    id: 'grok-sage',
    name: 'Grok Mindful Sage',
    title: 'Cosmic & Existential Guide',
    model: 'grok-2-latest',
    tagline: 'Radical existential clarity, cosmic mindfulness & deep truth',
    avatar: '🌌',
    badgeColor: 'text-purple-700 font-mono',
    description: 'Bridges deep contemplative philosophy, cosmic wonder, and pragmatic mental clarity.',
  },
];

const INITIAL_MESSAGES: Record<Locale, Record<ChatRole, string>> = {
  en: {
    'zen-master': 'Peace to you, traveler. Like a stone dropped into still water, every thought creates ripples across your awareness. What question or inner tangle brings you to this sanctuary today?',
    'serenity-coach': 'Welcome. Take a gentle breath in and allow your shoulders to drop. I am here to help you navigate everyday stress, cultivate gratitude, or wind down for peaceful rest. How are you feeling in this moment?',
    'instant-calmer': 'I am right here with you. If you are experiencing sudden panic or racing thoughts, take a deep breath. Tell me what is happening, or say "ground me" for an immediate somatic reset.',
    'grok-sage': 'Greetings from the cosmic silence. The universe has been meditating for 13.8 billion years, and in this breath, it experiences itself through you. What feeling, curiosity, or thought shall we explore together?',
  },
  fr: {
    'zen-master': 'Paix à vous. Comme une pierre glissant sur l’eau calme, chaque pensée crée des ondulations sur votre conscience. Quelle interrogation intérieure vous amène aujourd’hui ?',
    'serenity-coach': 'Bienvenue. Prenez une respiration douce et relâchez vos épaules. Je suis là pour vous accompagner face au stress quotidien, cultiver la gratitude ou trouver le calme. Comment vous sentez-vous ?',
    'instant-calmer': 'Je suis là avec vous. Si vous ressentez une montée d’anxiété, respirez profondément. Dites-moi ce que vous traversez, ou dites "ancrez-moi" pour un exercice somatique immédiat.',
    'grok-sage': 'Salutations depuis le silence cosmique. Dans ce souffle, l’univers fait l’expérience de lui-même à travers vous. Quelle pensée ou sensation souhaitez-vous explorer ?',
  },
  ar: {
    'zen-master': 'السلام والسكينة لك. مثل قطرة ماء في بركة ساكنة، كل فكرة تخلق تموجات في وعيك. ما هو السؤال أو الشعور الذي تحمله في قلبك اليوم؟',
    'serenity-coach': 'أهلاً بك. خذ نفساً عميقاً وأرخِ كتفيك برفق. أنا هنا لمساعدتك على تجاوز توتر العمل، وتنمية الامتنان، والخلود إلى راحة هادئة. كيف تشعر في هذه اللحظة؟',
    'instant-calmer': 'أنا معك هنا الآن. إذا كنت تشعر بنوبة قلق مفاجئة أو تسارع في الأفكار، خذ نفساً عميقاً. أخبرني بما يحدث، أو اطلب تمريناً مهدئاً فورياً.',
    'grok-sage': 'تحية من سكون الفضاء الواسع. يتأمل الكون في سكونه، وفي هذه اللحظة يتنفس عبر وعيك. ما السؤال أو المشاعر التي ترغب في استكشافها معاً؟',
  },
};

const PROMPT_SUGGESTIONS: Record<Locale, Record<ChatRole, string[]>> = {
  en: {
    'zen-master': [
      'How do I let go of attachment to outcomes?',
      'I feel an empty restlessness even when busy.',
      'What does it mean to observe the observer?',
    ],
    'serenity-coach': [
      'I have 5 minutes between meetings and feel overwhelmed.',
      'Help me prepare my mind for deep, uninterrupted sleep.',
      'Teach me a gentle loving-kindness practice.',
    ],
    'instant-calmer': [
      'I feel an anxiety spike. Ground me immediately.',
      'Guide me through a fast 1-minute box breathing cycle.',
      'Give me the 5-4-3-2-1 sensory grounding exercise.',
    ],
    'grok-sage': [
      'How does cosmic perspective dissolve daily anxiety?',
      'What is the relationship between consciousness and silence?',
      'Help me step out of ego chatter into radical presence.',
    ],
  },
  fr: {
    'zen-master': [
      'Comment lâcher prise sur le résultat des choses ?',
      'Je ressens un vide intérieur même en étant occupé.',
      'Que signifie observer ses propres pensées ?',
    ],
    'serenity-coach': [
      'J’ai 5 minutes entre deux réunions et je suis submergé.',
      'Aidez-moi à préparer mon esprit à un sommeil profond.',
      'Guidez-moi dans une pratique de bienveillance pour moi-même.',
    ],
    'instant-calmer': [
      'J’ai un pic d’angoisse. Aidez-moi tout de suite.',
      'Guidez-moi dans une respiration carrée d’une minute.',
      'Donnez-moi l’exercice d’ancrage 5-4-3-2-1.',
    ],
    'grok-sage': [
      'Comment la perspective cosmique dissout-elle l’anxiété ?',
      'Quelle est la relation entre conscience et silence ?',
      'Aidez-moi à sortir du bavardage mental vers une présence pure.',
    ],
  },
  ar: {
    'zen-master': [
      'كيف أتخلص من التعلق الزائد بالنتائج؟',
      'أشعر بفراغ داخلي وقلق رغم انشغالي الدائم.',
      'ما معنى أن أكون مراقباً لأفكاري دون التورط فيها؟',
    ],
    'serenity-coach': [
      'لدي 5 دقائق بين اجتماعات العمل وأشعر بالإرهاق.',
      'ساعدني على تهيئة ذهني لنوم عميق ومريح الليلة.',
      'علمني تمريناً للطف والمحبة مع نفسي.',
    ],
    'instant-calmer': [
      'أشعر بنوبة قلق مفاجئة. ساعدني على التهدئة الآن.',
      'أرشدني لتنفس المربع السريع لمدة دقيقة.',
      'اشرح لي تمرين التهدئة بالحواس ٥-٤-٣-٢-١.',
    ],
    'grok-sage': [
      'كيف تساعدنا النظرة الكونية في تبديد قلق الحياة اليومية؟',
      'ما هي العلاقة بين الوعي وسكون الكون؟',
      'ساعدني على تجاوز ضجيج الأفكار إلى حضور داخلي هادئ.',
    ],
  },
};

export const ChatGuideModal: React.FC<ChatGuideModalProps> = ({
  isOpen,
  onClose,
  onCraftMeditationFromTopic,
  currentLocale = 'en',
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>('serenity-coach');
  const [manualModelOverride, setManualModelOverride] = useState<GeminiModel | ''>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLocale];
  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[1];
  const activeModel = manualModelOverride || activeRoleConfig.model;

  const [messagesByRole, setMessagesByRole] = useState<Record<ChatRole, ChatMessage[]>>({
    'zen-master': [
      {
        id: 'init-zen',
        role: 'assistant',
        content: INITIAL_MESSAGES[currentLocale]['zen-master'],
        timestamp: Date.now(),
        modelUsed: 'gemini-4-argon',
        roleName: 'Zen Master Bodhi',
      },
    ],
    'serenity-coach': [
      {
        id: 'init-serenity',
        role: 'assistant',
        content: INITIAL_MESSAGES[currentLocale]['serenity-coach'],
        timestamp: Date.now(),
        modelUsed: 'gemini-3.8-flash',
        roleName: 'Serenity Coach Maya',
      },
    ],
    'instant-calmer': [
      {
        id: 'init-instant',
        role: 'assistant',
        content: INITIAL_MESSAGES[currentLocale]['instant-calmer'],
        timestamp: Date.now(),
        modelUsed: 'gemini-3.1-flash-lite',
        roleName: 'Instant Calmer Kai',
      },
    ],
    'grok-sage': [
      {
        id: 'init-grok',
        role: 'assistant',
        content: INITIAL_MESSAGES[currentLocale]['grok-sage'],
        timestamp: Date.now(),
        modelUsed: 'grok-2-latest',
        roleName: 'Grok Mindful Sage',
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessages = messagesByRole[selectedRole] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, currentMessages, selectedRole]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentMessages, userMsg];
    setMessagesByRole((prev) => ({
      ...prev,
      [selectedRole]: updatedMessages,
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const formattedForApi = updatedMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          modelOverride: manualModelOverride || undefined,
          messages: formattedForApi,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Take a slow, deep breath into this moment.',
        timestamp: Date.now(),
        modelUsed: data.modelUsed || activeModel,
        roleName: activeRoleConfig.name,
      };

      setMessagesByRole((prev) => ({
        ...prev,
        [selectedRole]: [...prev[selectedRole], botMsg],
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (confirm(t.clearChat)) {
      setMessagesByRole((prev) => ({
        ...prev,
        [selectedRole]: [
          {
            id: `init-${Date.now()}`,
            role: 'assistant',
            content: INITIAL_MESSAGES[currentLocale][selectedRole],
            timestamp: Date.now(),
            modelUsed: activeModel,
            roleName: activeRoleConfig.name,
          },
        ],
      }));
    }
  };

  const handleCraft = (botReply?: string) => {
    if (onCraftMeditationFromTopic) {
      const lastUser = [...currentMessages].reverse().find((m) => m.role === 'user');
      const topic = lastUser?.content || activeRoleConfig.title;
      onCraftMeditationFromTopic(topic, botReply || currentMessages[currentMessages.length - 1]?.content || '');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-3xl h-[92vh] sm:h-[85vh] bg-[#FCFCF8] border border-[#BCD0C8] rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden text-start">
        {/* MindRested Deep Botanical Teal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4.5 bg-[#123F40] text-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="size-9 sm:size-10 rounded-full bg-white/10 flex items-center justify-center text-base sm:text-lg shrink-0">
              {activeRoleConfig.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <h2 className="text-sm sm:text-base font-display font-semibold text-white rtl:font-sans truncate">
                  {activeRoleConfig.name}
                </h2>
                <span className="hidden sm:inline text-[11px] font-mono text-[#DAE7DE]">
                  · {activeRoleConfig.title}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#DAE7DE]/80 font-light truncate">{activeRoleConfig.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={handleClear}
              title={t.clearChat}
              className="size-9 sm:size-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="size-9 sm:size-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Segmented Persona Pills: Balanced 2x2 grid on mobile, 4-col row on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-[#DAE7DE]/40 border-b border-[#BCD0C8]/70">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-3 text-start rounded-xl sm:rounded-full transition-all ${
                  isSelected
                    ? 'bg-[#175C62] text-white shadow-xs'
                    : 'text-[#1A2F32]/80 hover:bg-white/60'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-semibold truncate flex items-center gap-1">
                  <span>{r.avatar}</span>
                  <span className="truncate">{r.name.split(' ')[0]} {r.name.split(' ')[1] || ''}</span>
                </div>
                <div className="text-[10px] font-mono opacity-80 truncate">
                  {r.title.split(' ')[0]} {r.title.split(' ')[1] || ''}
                </div>
              </button>
            );
          })}
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 bg-[#FCFCF8]">
          {currentMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-xl space-y-1.5 ${
                  isUser ? 'ms-auto items-end' : 'me-auto items-start'
                }`}
              >
                <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#175C62]/70">
                  {isUser ? 'You' : `${activeRoleConfig.name} · ${activeRoleConfig.title}`}
                </div>

                <div
                  className={`p-3.5 sm:p-4 rounded-[1.25rem] text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#175C62] text-white rounded-tr-none rtl:rounded-tr-[1.25rem] rtl:rounded-tl-none'
                      : 'bg-[#DAE7DE]/40 border border-[#BCD0C8]/70 text-[#053333] font-serif rounded-tl-none rtl:rounded-tl-[1.25rem] rtl:rounded-tr-none'
                  }`}
                >
                  {msg.content}
                </div>

                {!isUser && onCraftMeditationFromTopic && (
                  <button
                    onClick={() => handleCraft(msg.content)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#175C62] hover:text-[#053333] pt-0.5"
                  >
                    <Sparkles className="size-3.5" />
                    <span>{t.createMeditationFromChat}</span>
                  </button>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="text-xs font-serif italic text-[#175C62]">
              {activeRoleConfig.name} {t.chatThinking}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Strip */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#FCFCF8] border-t border-[#BCD0C8]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] sm:text-[11px] text-[#175C62] shrink-0 font-mono font-semibold">
            {t.chatInquiries}
          </span>
          {PROMPT_SUGGESTIONS[currentLocale][selectedRole].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="shrink-0 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-[#BCD0C8] text-[#1A2F32] hover:border-[#175C62] hover:bg-[#FCF2E8] transition-colors whitespace-nowrap shadow-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar (44px min height touch target) */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#BCD0C8]/70">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-2.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={isLoading}
              className="flex-1 px-4 py-3 min-h-11 bg-[#FCFCF8] border border-[#BCD0C8] rounded-full text-xs text-[#053333] placeholder-[#175C62]/50 focus:outline-none focus:border-[#175C62] transition-colors shadow-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="flex items-center justify-center size-11 rounded-full bg-[#175C62] hover:bg-[#123F40] disabled:opacity-40 text-white font-medium transition-all shadow-sm shrink-0"
            >
              <Send className="size-4 rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
