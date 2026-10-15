# Implementation Plan: MindRested "Calm Clinical Warmth" Transformation

Transform the guided meditation sanctuary into the **MindRested design system**, embracing **Calm Clinical Warmth**—the synthesis of editorial serenity (warm ivory parchment surfaces, humanist serif headlines, organic rounded geometry, concentric whisper rings) and clinical credibility, with full multilingual support across **Arabic (RTL with Moroccan Darija context)**, **French (LTR)**, and **English (LTR)**.

---

## Proposed Changes

### 1. Design System & Theme Foundation (`src/index.css`, `index.html`)
- **Color Architecture**:
  - Canvas: Warm ivory/parchment (`#FCFCF8` / `secondary-50`) and soft sage mist (`#DAE7DE` / `primary-50`).
  - Anchor: Botanical forest-teal (`#175C62` / `primary-6000`), deep display ink (`#053333` / `primary-900`), and deep feature surface teal (`#123F40`).
  - Warm Accents: Sunlit sand (`#F1E8D7`), warm terracotta/coral (`#FF874E` / `secondary-800`), and honey amber (`#F2B84B`).
- **Typography Scale**:
  - Headings: Editorial serif (`Recoleta` style via `Playfair Display`/`Cormorant Garamond`).
  - Body: Humanist sans (`Plus Jakarta Sans` / `Triomphe`).
  - Arabic: **Cairo** font loaded via Google Fonts for Arabic RTL (`rtl:font-sans rtl:tracking-normal rtl:leading-relaxed`).
- **Surface Geometry & Motifs**:
  - Pill buttons (`rounded-full`, min 44px height for accessibility).
  - Feature cards: `rounded-[2rem]` with signature concentric whisper rings (`border border-white/10 rounded-full`).
  - Pathway cards: `rounded-[1.5rem]` with subtle `border-primary-900/10` and warm ivory hover states.

### 2. Multilingual (AR RTL, FR, EN) Localization Engine (`src/utils/i18n.ts`)
- Lightweight, zero-dependency multilingual dictionary for:
  - English (`en`), Français (`fr`), and العربية (`ar` with RTL direction).
  - UI labels: Navigation, buttons, categories, stats, teleprompter, and breathing phases.
  - Directional icon mirroring (`rtl:-scale-x-100` on chevrons and play icons).
  - Root attribute update (`document.documentElement.dir` and `lang`).

### 3. Header Navigation & Brand Identity (`src/components/Navbar.tsx`)
- MindRested brand lockup with organic mind/heart emblem mark.
- Clean navigation links: Sanctuary, AI Atelier, Pranayama.
- Language switcher dropdown: English (`EN`), Français (`FR`), العربية (`AR`).
- Primary pill CTA (`Consult Guide`).

### 4. Sanctuary Library (`src/components/SanctuaryLibrary.tsx`)
- Editorial marquee hero card in `#123F40` with concentric rings, warm sunlit sand CTA pill (`bg-[#f1e8d7] text-[#123f40] hover:bg-white`), and high-fidelity fine art image.
- Operational utility ribbon with tabular metrics.
- Segmented filter controls with warm parchment active states.
- Session cards with unboxed metadata (`5 min · 2K Art · Kore Voice`), organic corner radii, and pull-quote mantras.

### 5. Custom Session Creator (`src/components/CustomSessionCreator.tsx`)
- Styled in warm ivory parchment cards with botanical forest teal accents.
- Segmented controls for duration, image size (1K, 2K, 4K), aspect ratio, voice persona, and acoustic tracks.
- Full compatibility with `gemini-3-pro-image-preview` and `gemini-3.8-flash-tts`.

### 6. Pranayama Breathing Sanctuary (`src/components/BreathingVisualizer.tsx`)
- Warm sage and parchment ambient backdrop.
- Sacred concentric breathing rings with animated botanical teal orb.
- Multilingual breathing guidance (Inhale, Hold, Exhale, Pause).

### 7. Immersive Session Player (`src/components/SessionPlayerModal.tsx`)
- Full-bleed meditative visualizer with subtle Ken Burns motion.
- Concentric ring motifs, floating glassmorphic control dock with pill play/pause button.
- Teleprompter guidance displayed in warm editorial serif with live multilingual translation toggle.
- Sanctuary mixer with dual volume sliders (Voiceover + Web Audio ambient soundscape).

### 8. Mindful AI Chat Guide (`src/components/ChatGuideModal.tsx`)
- MindRested clinical warmth styling with 3 roles:
  - 🧘 **Zen Master Bodhi** (`gemini-4-argon` / complex inquiries)
  - 🌿 **Serenity Coach Maya** (`gemini-3.8-flash` / daily calm)
  - ⚡ **Instant Calmer Kai** (`gemini-3.1-flash-lite` / rapid somatic resets)
- Multilingual starter prompts in English, French, and Arabic.

---

## Verification Plan

### Automated Tests & Compilations
- Run `lint_applet` (`tsc --noEmit`) to ensure type safety across all components and i18n dictionaries.
- Run `compile_applet` (`npm run build`) to verify Vite bundling.
- Restart dev server and verify HTTP response and endpoints.

### Visual & Interactive Verification
- Switch languages between English, French, and Arabic to verify RTL layout, Cairo typography, and logical spacing.
- Verify 44px min touch target on all pill buttons.
- Test custom session generation, TTS narration, high-res artwork, and soundscape mixer.
