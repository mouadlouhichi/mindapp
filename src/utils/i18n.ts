export type Locale = 'en' | 'fr' | 'ar';

export interface Translations {
  brandName: string;
  brandTagline: string;
  navSanctuary: string;
  navAtelier: string;
  navPranayama: string;
  navConsultGuide: string;
  
  // Hero Section
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  heroCreateBtn: string;
  heroGuideBtn: string;
  heroPavilionCaption: string;

  // Operational Ribbon
  kpiPracticeTime: string;
  kpiStreak: string;
  kpiSanctuarySize: string;
  kpiTtsEngine: string;
  kpiUnitMinutes: string;
  kpiUnitDays: string;
  kpiUnitSessions: string;

  // Filter Categories
  filterAll: string;
  filterSaved: string;
  filterSleep: string;
  filterAnxiety: string;
  filterFocus: string;
  filterCompassion: string;
  filterCustom: string;
  searchPlaceholder: string;
  emptyFilterMsg: string;

  // Cards & Actions
  beginSession: string;
  playAction: string;
  minLabel: string;
  artLabel: string;
  voiceLabel: string;
  mantraLabel: string;

  // Atelier Creator
  atelierEyebrow: string;
  atelierTitle: string;
  atelierSubtitle: string;
  returnToSanctuary: string;
  step1Title: string;
  themeLabel: string;
  themePlaceholder: string;
  durationLabel: string;
  step2Title: string;
  resolutionAffordance: string;
  aspectRatioLabel: string;
  step3Title: string;
  voicePersonaLabel: string;
  acousticTrackLabel: string;
  generateBtn: string;
  synthesizingBtn: string;
  previewTitle: string;
  previewEmptyPrompt: string;
  saveToSanctuary: string;

  // Pranayama Breath
  pranayamaEyebrow: string;
  pranayamaTitle: string;
  pranayamaSubtitle: string;
  cyclesCompleted: string;
  pauseRhythm: string;
  resumeRhythm: string;
  phaseInhale: string;
  phaseHold: string;
  phaseExhale: string;
  phasePause: string;

  // Player Modal
  stageLabel: string;
  ofLabel: string;
  repeatSession: string;
  returnHome: string;
  sessionComplete: string;
  completionBody: string;
  soundscapeMixer: string;
  voiceVolume: string;
  soundscapeVolume: string;
  ambientTrack: string;
  scriptLabel: string;
  viewScript: string;
  hideScript: string;

  // Chat Guide
  chatInquiries: string;
  chatPlaceholder: string;
  createMeditationFromChat: string;
  chatThinking: string;
  clearChat: string;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    brandName: 'MindRested',
    brandTagline: 'Calm Clinical Sanctuary',
    navSanctuary: 'Sanctuary',
    navAtelier: 'AI Atelier',
    navPranayama: 'Pranayama',
    navConsultGuide: 'Consult Guide',

    heroEyebrow: 'Calm Clinical Sanctuary · Daily Practice',
    heroHeadline: 'Stillness is not the absence of sound, but the presence of awareness.',
    heroDescription:
      'Craft custom guided meditation journeys tailored to your immediate emotional state. Narrated with precision via Gemini 3.8 Flash TTS, framed with high-fidelity artwork, and grounded in clinical serenity.',
    heroCreateBtn: 'Create Custom Session',
    heroGuideBtn: 'Consult Mindful Guide',
    heroPavilionCaption: 'Pavilion of Clear Dawn',

    kpiPracticeTime: 'PRACTICE TIME',
    kpiStreak: 'CONSISTENCY STREAK',
    kpiSanctuarySize: 'SANCTUARY REPOSITORY',
    kpiTtsEngine: 'VOICE SYNTHESIS',
    kpiUnitMinutes: '45 Mindful Minutes',
    kpiUnitDays: '4 Days Consistent',
    kpiUnitSessions: 'Guided Journeys',

    filterAll: 'All Journeys',
    filterSaved: 'Saved',
    filterSleep: 'Deep Sleep',
    filterAnxiety: 'Calm & Release',
    filterFocus: 'Mental Clarity',
    filterCompassion: 'Heart & Metta',
    filterCustom: 'Personal Atelier',
    searchPlaceholder: 'Search sanctuary archive...',
    emptyFilterMsg: 'No journeys match the selected filter.',

    beginSession: 'Begin Session',
    playAction: 'Play Session →',
    minLabel: 'min',
    artLabel: 'Artwork',
    voiceLabel: 'Voice',
    mantraLabel: 'Anchor Mantra',

    atelierEyebrow: 'Meditation Atelier · Session Generation',
    atelierTitle: 'Design a Guided Meditation',
    atelierSubtitle:
      'Compose a bespoke meditation script with Gemini 3.8 Flash, synthesized voiceovers via Gemini 3.8 Flash TTS, and custom high-resolution scenery from Gemini 3 Pro.',
    returnToSanctuary: '← Return to Sanctuary',
    step1Title: '01. Intent & Duration',
    themeLabel: 'Theme or Mental State:',
    themePlaceholder: 'e.g. Unwinding after a stressful workday...',
    durationLabel: 'Duration:',
    step2Title: '02. Visual Scenery & Resolution',
    resolutionAffordance: 'Image Resolution Affordance:',
    aspectRatioLabel: 'Aspect Ratio:',
    step3Title: '03. Narration Voice & Soundscape',
    voicePersonaLabel: 'Voice Persona:',
    acousticTrackLabel: 'Ambient Acoustic Track:',
    generateBtn: 'Generate Custom Meditation Session',
    synthesizingBtn: 'Synthesizing Session...',
    previewTitle: 'Sanctuary Preview',
    previewEmptyPrompt: 'Configure your session preferences on the left and synthesize your sanctuary.',
    saveToSanctuary: 'Save to Sanctuary',

    pranayamaEyebrow: 'Somatic Vagal Regulation · Pranayama',
    pranayamaTitle: 'Breathwork Sanctuary',
    pranayamaSubtitle:
      'Rhythmically regulate your autonomic nervous system, decrease cortisol, and anchor your awareness into present stillness.',
    cyclesCompleted: 'Cycles Completed',
    pauseRhythm: 'Pause Rhythm',
    resumeRhythm: 'Resume Rhythm',
    phaseInhale: 'Inhale deeply',
    phaseHold: 'Retain the stillness',
    phaseExhale: 'Exhale softly',
    phasePause: 'Rest in quiet presence',

    stageLabel: 'Stage',
    ofLabel: 'of',
    repeatSession: 'Repeat',
    returnHome: 'Return Home',
    sessionComplete: 'Session Complete',
    completionBody: 'You have meditated for mindful minutes. Take this grounded tranquility into the rest of your day.',
    soundscapeMixer: 'Sanctuary Mixer',
    voiceVolume: 'Voice Volume',
    soundscapeVolume: 'Soundscape Volume',
    ambientTrack: 'Ambient Track:',
    scriptLabel: 'Meditation Script',
    viewScript: 'View Script',
    hideScript: 'Hide Script',

    chatInquiries: 'Inquiries:',
    chatPlaceholder: 'Share your contemplation or request somatic guidance...',
    createMeditationFromChat: 'Create meditation from this guidance',
    chatThinking: 'is meditating upon your reflection...',
    clearChat: 'Clear conversation',
  },

  fr: {
    brandName: 'MindRested',
    brandTagline: 'Sanctuaire Clinique Apaisant',
    navSanctuary: 'Sanctuaire',
    navAtelier: 'Atelier IA',
    navPranayama: 'Pranayama',
    navConsultGuide: 'Consulter le Guide',

    heroEyebrow: 'Sanctuaire Clinique Apaisant · Pratique Quotidienne',
    heroHeadline: 'Le calme n’est pas l’absence de bruit, mais la présence de la conscience.',
    heroDescription:
      'Créez des voyages méditatifs personnalisés selon votre état émotionnel. Narration précise via Gemini 3.8 Flash TTS, visuels en haute fidélité et sérénité clinique.',
    heroCreateBtn: 'Créer une Séance',
    heroGuideBtn: 'Consulter le Guide',
    heroPavilionCaption: 'Pavillon de l’Aube Claire',

    kpiPracticeTime: 'TEMPS DE PRATIQUE',
    kpiStreak: 'SÉRIE DE RÉGULARITÉ',
    kpiSanctuarySize: 'RÉPERTOIRE DU SANCTUAIRE',
    kpiTtsEngine: 'SYNTHÈSE VOCALE',
    kpiUnitMinutes: '45 Minutes Conscientes',
    kpiUnitDays: '4 Jours Consécutifs',
    kpiUnitSessions: 'Voyages Guidés',

    filterAll: 'Tous les Voyages',
    filterSaved: 'Enregistrés',
    filterSleep: 'Sommeil Profond',
    filterAnxiety: 'Calme & Libération',
    filterFocus: 'Clarté Mentale',
    filterCompassion: 'Cœur & Bienveillance',
    filterCustom: 'Atelier Personnel',
    searchPlaceholder: 'Rechercher dans le sanctuaire...',
    emptyFilterMsg: 'Aucun voyage ne correspond au filtre sélectionné.',

    beginSession: 'Commencer la Séance',
    playAction: 'Lancer la Séance →',
    minLabel: 'min',
    artLabel: 'Œuvre',
    voiceLabel: 'Voix',
    mantraLabel: 'Mantra d’Ancrage',

    atelierEyebrow: 'Atelier Méditatif · Génération de Séances',
    atelierTitle: 'Concevoir une Méditation Guidée',
    atelierSubtitle:
      'Composez un script sur mesure avec Gemini 3.8 Flash, des voix apaisantes avec Gemini 3.8 Flash TTS et des toiles 4K avec Gemini 3 Pro.',
    returnToSanctuary: '← Retour au Sanctuaire',
    step1Title: '01. Intention & Durée',
    themeLabel: 'Thème ou État Émotionnel :',
    themePlaceholder: 'ex. Décompresser après une longue journée...',
    durationLabel: 'Durée :',
    step2Title: '02. Paysage Visuel & Résolution',
    resolutionAffordance: 'Résolution de l’Image :',
    aspectRatioLabel: 'Format d’Affichage :',
    step3Title: '03. Voix de Narration & Ambiance',
    voicePersonaLabel: 'Personnalité Vocale :',
    acousticTrackLabel: 'Piste Acoustique Ambiante :',
    generateBtn: 'Générer la Séance Personnalisée',
    synthesizingBtn: 'Synthèse en cours...',
    previewTitle: 'Aperçu du Sanctuaire',
    previewEmptyPrompt: 'Configurez vos préférences à gauche pour générer votre séance méditative.',
    saveToSanctuary: 'Enregistrer dans le Sanctuaire',

    pranayamaEyebrow: 'Régulation Vagale Somatique · Pranayama',
    pranayamaTitle: 'Sanctuaire de Respiration',
    pranayamaSubtitle:
      'Régulez votre système nerveux autonome, réduisez le cortisol et ancrez votre esprit dans le moment présent.',
    cyclesCompleted: 'Cycles Complétés',
    pauseRhythm: 'Mettre en Pause',
    resumeRhythm: 'Reprendre le Rythme',
    phaseInhale: 'Inspirez profondément',
    phaseHold: 'Retenez le calme',
    phaseExhale: 'Expirez doucement',
    phasePause: 'Reposez-vous en silence',

    stageLabel: 'Étape',
    ofLabel: 'sur',
    repeatSession: 'Recommencer',
    returnHome: 'Retour à l’Accueil',
    sessionComplete: 'Séance Terminée',
    completionBody: 'Vous avez médité avec pleine conscience. Emportez cette sérénité pour le reste de votre journée.',
    soundscapeMixer: 'Mixeur du Sanctuaire',
    voiceVolume: 'Volume de la Voix',
    soundscapeVolume: 'Volume de l’Ambiance',
    ambientTrack: 'Piste Ambiante :',
    scriptLabel: 'Script Méditatif',
    viewScript: 'Voir le Script',
    hideScript: 'Masquer le Script',

    chatInquiries: 'Inspirations :',
    chatPlaceholder: 'Partagez votre réflexion ou demandez un conseil somatique...',
    createMeditationFromChat: 'Créer une méditation à partir de ce conseil',
    chatThinking: 'médite sur vos paroles...',
    clearChat: 'Effacer l’échange',
  },

  ar: {
    brandName: 'مايند رستد',
    brandTagline: 'ملاذ الراحة النفسية والتأمل',
    navSanctuary: 'الملاذ',
    navAtelier: 'مختبر التأمل',
    navPranayama: 'تنفس براناياما',
    navConsultGuide: 'استشارة المرشد',

    heroEyebrow: 'ملاذ السكينة النفسية · ممارسة يومية',
    heroHeadline: 'السكينة ليست غياب الصوت، بل هي حضور الوعي والاطمئنان.',
    heroDescription:
      'اصنع جلسات تأمل موجهة خصيصاً لحالتك النفسية اليوم. تسجيلات صوتية هادئة عبر Gemini 3.8 Flash TTS، ولوحات بصرية فائقة الدقة، ورعاية نفسية مطمئنة مستوحاة من هدوء الطبيعة.',
    heroCreateBtn: 'إنشاء جلسة مخصصة',
    heroGuideBtn: 'محادثة المرشد النفسي',
    heroPavilionCaption: 'رواق الفجر الصافي',

    kpiPracticeTime: 'وقت التأمل',
    kpiStreak: 'الانتظام اليومي',
    kpiSanctuarySize: 'مستودع الجلسات',
    kpiTtsEngine: 'محرك الصوت الذكي',
    kpiUnitMinutes: '45 دقيقة تأمل',
    kpiUnitDays: '4 أيام متتالية',
    kpiUnitSessions: 'رحلات موجهة',

    filterAll: 'كل الرحلات',
    filterSaved: 'المحفوظة',
    filterSleep: 'نوم عميق',
    filterAnxiety: 'تسكين التوتر',
    filterFocus: 'صفاء الذهن',
    filterCompassion: 'المحبة واللطف',
    filterCustom: 'جلساتي الخاصة',
    searchPlaceholder: 'البحث في رحلات الملاذ...',
    emptyFilterMsg: 'لم يتم العثور على رحلات توافق هذا الاختيار.',

    beginSession: 'بدء الجلسة',
    playAction: 'تشغيل الجلسة ←',
    minLabel: 'دقيقة',
    artLabel: 'لوحة',
    voiceLabel: 'صوت',
    mantraLabel: 'توكيد الطمأنينة',

    atelierEyebrow: 'مختبر التأمل · توليد الجلسات',
    atelierTitle: 'صمم جلسة تأمل خاصة بك',
    atelierSubtitle:
      'قم بتأليف نصوص تأملية مخصصة مع Gemini 3.8 Flash، واستمع إلى صوت مهدئ عبر Gemini 3.8 Flash TTS، مع صور ولوحات طبيعية عالية الدقة عبر Gemini 3 Pro.',
    returnToSanctuary: '→ العودة إلى الملاذ',
    step1Title: '٠١. النية والمدة الزمنية',
    themeLabel: 'الموضوع أو الحالة النفسية:',
    themePlaceholder: 'مثال: التخلص من التوتر بعد يوم عمل شاق...',
    durationLabel: 'المدة:',
    step2Title: '٠٢. المشهد البصري ودقة الصورة',
    resolutionAffordance: 'خيارات دقة اللوحة:',
    aspectRatioLabel: 'أبعاد الصورة:',
    step3Title: '٠٣. الصوت والمؤثرات الصوتية',
    voicePersonaLabel: 'شخصية الراوي:',
    acousticTrackLabel: 'الموسيقى الصوتية المحيطية:',
    generateBtn: 'توليد جلسة التأمل المخصصة',
    synthesizingBtn: 'جاري توليد الجلسة...',
    previewTitle: 'معاينة الجلسة',
    previewEmptyPrompt: 'حدد خيارات جلستك من القائمة لبدء التوليد والاستماع.',
    saveToSanctuary: 'حفظ في الملاذ',

    pranayamaEyebrow: 'تهدئة الجهاز العصبي · براناياما',
    pranayamaTitle: 'ملاذ التنفس الواعي',
    pranayamaSubtitle:
      'اضبط إيقاع تنفسك لخفض الكورتيزول، وتسكين القلق، ورسوخ الوعي في اللحظة الحاضرة بطمأنينة تامة.',
    cyclesCompleted: 'دورات مكتملة',
    pauseRhythm: 'إيقاف مؤقت',
    resumeRhythm: 'استئناف التنفس',
    phaseInhale: 'شهيق عميق وهادئ',
    phaseHold: 'احبس النفس بلطف وسكينة',
    phaseExhale: 'زفير بطيء وتفريغ التوتر',
    phasePause: 'استرح في سكون واسترخاء',

    stageLabel: 'المرحلة',
    ofLabel: 'من',
    repeatSession: 'إعادة الجلسة',
    returnHome: 'العودة للملاذ',
    sessionComplete: 'اكتملت الجلسة بنجاح',
    completionBody: 'لقد مارست التأمل بوعي كامل. خذ هذه السكينة والراحة معك في باقي يومك.',
    soundscapeMixer: 'مازج المؤثرات الصوتية',
    voiceVolume: 'مستوى صوت الراوي',
    soundscapeVolume: 'مستوى الصوت المحيطي',
    ambientTrack: 'المؤثرات المحيطية:',
    scriptLabel: 'نص الجلسة الكامل',
    viewScript: 'عرض النص',
    hideScript: 'إخفاء النص',

    chatInquiries: 'أسئلة وتأملات مقترحة:',
    chatPlaceholder: 'شارك ما تشعر به أو اطلب تمريناً مهدئاً...',
    createMeditationFromChat: 'تحويل هذا الإرشاد إلى جلسة تأمل',
    chatThinking: 'يتأمل في استفسارك بكل هدوء...',
    clearChat: 'مسح المحادثة',
  },
};
