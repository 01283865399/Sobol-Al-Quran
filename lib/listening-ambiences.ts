import {
  CloudRain,
  CloudSun,
  Building2,
  Flame,
  ImageOff,
  Landmark,
  Trees,
  Waves,
} from 'lucide-react';

const getMediaUrl = (asset: string, path: string) =>
  import.meta.env.PROD
    ? `/api/media/${asset}`
    : path;

export const LISTENING_AMBIENCES = [
  {
    id: 'rain',
    label: 'مطر',
    icon: CloudRain,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1280&q=65',
    video: getMediaUrl('rain', '/assets/مطر.mp4'),
    audioSource: getMediaUrl('rain-audio', '/assets/مطر-صوت.mp3'),
    hasAudio: true,
    soundMode: 'audio',
    fallback: 'linear-gradient(145deg, #263b43, #101923 62%, #182c30)',
  },
  {
    id: 'fire',
    label: 'نار الحطب',
    icon: Flame,
    image:
      'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?auto=format&fit=crop&w=1280&q=65',
    video: getMediaUrl('fire', '/assets/نار.mp4'),
    audioSource: getMediaUrl('fire-audio', '/assets/نار-صوت.mp3'),
    hasAudio: true,
    soundMode: 'audio',
    fallback: 'linear-gradient(145deg, #603b2d, #1c1717 62%, #36251d)',
  },
  {
    id: 'nature',
    label: 'الطبيعة',
    icon: Trees,
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1280&q=65',
    video: getMediaUrl('nature', '/assets/ضباب.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'generated',
    fallback: 'linear-gradient(145deg, #29483f, #111b1b 62%, #22392f)',
  },
  {
    id: 'sea',
    label: 'البحر',
    icon: Waves,
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1280&q=65',
    video: getMediaUrl('sea', '/assets/بحر.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'generated',
    fallback: 'linear-gradient(145deg, #34565e, #101c25 62%, #1e3a43)',
  },
  {
    id: 'sky',
    label: 'السماء',
    icon: CloudSun,
    image:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1280&q=65',
    video: getMediaUrl('sky', '/assets/سماء.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'generated',
    fallback: 'linear-gradient(145deg, #59666b, #1b2028 62%, #292c34)',
  },
  {
    id: 'kaaba-tawaf',
    label: 'طواف حول الكعبة',
    icon: Landmark,
    image: '/images/ambiences/kaaba-tawaf.jpg',
    video: getMediaUrl('kaaba-tawaf', '/assets/kaaba-tawaf.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'none',
    sourceAttribution: 'Masajida Allah · CC BY 3.0',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Time_lapse_of_Masjid_al-%E1%B8%A4ar%C4%81m_(kaaba)_%26_hajj_rites.webm',
    fallback: 'linear-gradient(145deg, #51452d, #171915 62%, #30291c)',
  },
  {
    id: 'nabawi-evening',
    label: 'المسجد النبوي · المساء',
    icon: Building2,
    image: '/images/ambiences/nabawi-evening.jpg',
    video: getMediaUrl('nabawi-evening', '/assets/nabawi-evening.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'none',
    sourceAttribution: 'Yusuf Khan Afridi · Pexels',
    sourceUrl: 'https://www.pexels.com/video/evening-at-al-masjid-an-nabawi-in-madinah-31281542/',
    fallback: 'linear-gradient(145deg, #4a5261, #171d25 62%, #393c47)',
  },
  {
    id: 'nabawi-courtyard',
    label: 'المسجد النبوي · الساحات',
    icon: Building2,
    image: '/images/ambiences/nabawi-courtyard.jpg',
    video: getMediaUrl('nabawi-courtyard', '/assets/nabawi-courtyard.mp4'),
    audioSource: null,
    hasAudio: false,
    soundMode: 'none',
    sourceAttribution: 'Aamir Somewhere · Pexels',
    sourceUrl: 'https://www.pexels.com/video/dynamic-scenes-at-masjid-al-nabawi-31487996/',
    fallback: 'linear-gradient(145deg, #465b5b, #171e20 62%, #303f3e)',
  },
  {
    id: 'none',
    label: 'بدون خلفية',
    icon: ImageOff,
    image: null,
    video: null,
    audioSource: null,
    hasAudio: false,
    soundMode: 'none',
    fallback: 'linear-gradient(145deg, #18231f, #090f13 65%, #111a18)',
  },
] as const;

export const HARAMAIN_AMBIENCE_IDS = [
  'kaaba-tawaf',
  'nabawi-evening',
  'nabawi-courtyard',
  'none',
] as const;
