import heroImage from './hero_meditation_sanctuary_1792060521641.jpg';
import bambooMistImage from './session_bamboo_mist_1792060522120.jpg';
import cosmicNebulaImage from './session_cosmic_nebula_1792060521709.jpg';
import goldenLotusImage from './session_golden_lotus_1792060522202.jpg';
import zenMountainImage from './session_zen_mountain_1792060574766.jpg';

export const MEDITATION_IMAGES = {
  hero: heroImage || '/images/hero_meditation_sanctuary.jpg',
  bambooMist: bambooMistImage || '/images/session_bamboo_mist.jpg',
  cosmicNebula: cosmicNebulaImage || '/images/session_cosmic_nebula.jpg',
  goldenLotus: goldenLotusImage || '/images/session_golden_lotus.jpg',
  zenMountain: zenMountainImage || '/images/session_zen_mountain.jpg',
};

/**
 * Resolves any session image URL into a verified, high-availability image.
 * Safely repairs legacy/cached paths (e.g. /src/assets/images/...) and provides
 * thematic fallbacks based on session titles or themes.
 */
export function resolveSessionImageUrl(url?: string, context?: string): string {
  if (url && !url.startsWith('/src/assets/images/')) {
    // If it's a valid bundled asset URL, base64 data URI, or /images/ URL
    if (url.startsWith('/assets/') || url.startsWith('/images/') || url.startsWith('data:') || url.startsWith('http')) {
      return url;
    }
  }

  // Check for specific session keywords in url or context
  const target = `${url || ''} ${context || ''}`.toLowerCase();
  if (target.includes('cosmic') || target.includes('nebula') || target.includes('starlight') || target.includes('sleep')) {
    return MEDITATION_IMAGES.cosmicNebula;
  }
  if (target.includes('bamboo') || target.includes('rain') || target.includes('forest') || target.includes('anxiety')) {
    return MEDITATION_IMAGES.bambooMist;
  }
  if (target.includes('lotus') || target.includes('metta') || target.includes('compassion') || target.includes('heart')) {
    return MEDITATION_IMAGES.goldenLotus;
  }
  if (target.includes('mountain') || target.includes('zen') || target.includes('focus') || target.includes('clarity')) {
    return MEDITATION_IMAGES.zenMountain;
  }

  return MEDITATION_IMAGES.hero;
}

export {
  heroImage,
  bambooMistImage,
  cosmicNebulaImage,
  goldenLotusImage,
  zenMountainImage,
};
