import {
  CloudRain,
  CloudSun,
  Flame,
  ImageOff,
  Trees,
  Waves,
} from 'lucide-react';

export const LISTENING_AMBIENCES = [
  {
    id: 'rain',
    label: 'مطر',
    icon: CloudRain,
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85',
    video: '/assets/مطر.mp4',
    audioSource: '/assets/مطر-صوت.mp3',
    hasAudio: true,
    fallback: 'linear-gradient(145deg, #263b43, #101923 62%, #182c30)',
  },
  {
    id: 'fire',
    label: 'نار الحطب',
    icon: Flame,
    image:
      'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?auto=format&fit=crop&w=2400&q=85',
    video: '/assets/نار.mp4',
    audioSource: '/assets/نار-صوت.mp3',
    hasAudio: true,
    fallback: 'linear-gradient(145deg, #603b2d, #1c1717 62%, #36251d)',
  },
  {
    id: 'nature',
    label: 'الطبيعة',
    icon: Trees,
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=85',
    video: '/assets/ضباب.mp4',
    audioSource: null,
    hasAudio: false,
    fallback: 'linear-gradient(145deg, #29483f, #111b1b 62%, #22392f)',
  },
  {
    id: 'sea',
    label: 'البحر',
    icon: Waves,
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2400&q=85',
    video: '/assets/بحر.mp4',
    audioSource: null,
    hasAudio: false,
    fallback: 'linear-gradient(145deg, #34565e, #101c25 62%, #1e3a43)',
  },
  {
    id: 'sky',
    label: 'السماء',
    icon: CloudSun,
    image:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=85',
    video: '/assets/سماء.mp4',
    audioSource: null,
    hasAudio: false,
    fallback: 'linear-gradient(145deg, #59666b, #1b2028 62%, #292c34)',
  },
  {
    id: 'none',
    label: 'بدون خلفية',
    icon: ImageOff,
    image: null,
    video: null,
    audioSource: null,
    hasAudio: false,
    fallback: 'linear-gradient(145deg, #18231f, #090f13 65%, #111a18)',
  },
] as const;
