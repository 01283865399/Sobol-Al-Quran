const QURAN_API_BASE_URL = 'https://api.alquran.cloud/v1';

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  number: number;
  numberInSurah: number;
  text: string;
  page: number;
  sajda: boolean | object;
}

export interface QuranSurah extends SurahMeta {
  ayahs: QuranAyah[];
}

export interface QuranSearchMatch {
  number: number;
  numberInSurah: number;
  text: string;
  sajda: boolean | object;
  surah: Pick<
    SurahMeta,
    'number' | 'name' | 'englishName' | 'englishNameTranslation' | 'revelationType'
  >;
}

export interface QuranSearchResult {
  count: number;
  matches: QuranSearchMatch[];
}

export interface QuranAudioTrack {
  numberInSurah: number;
  sources: string[];
}

export interface QuranReciter {
  id: string;
  name: string;
  englishName: string;
  bio: string;
  fullSurahAudioBaseUrl?: string;
  country?: 'Egypt';
  recitationCategory: 'murattal' | 'mujawwad';
  honorTier?: 'gold' | 'bronze';
  recitationStyle?: string;
  surahAudioUrls?: Partial<Record<number, string>>;
  availableSurahNumbers?: number[];
  recordingsSourceUrl?: string;
  ayahAudioEdition?: string | null;
  portraitUrl?: string;
  portraitSourceUrl?: string;
  portraitLicense?: string;
  portraitAttribution?: string;
}

const archiveAudioUrl = (identifier: string, filename: string) =>
  `https://archive.org/download/${identifier}/${encodeURIComponent(filename)}`;

export const QURAN_RECITERS: QuranReciter[] = [
  {
    id: 'ar.abdullahbasfar',
    name: 'عبد الله بصفر',
    englishName: 'Abdullah Basfar',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة برواية حفص عن عاصم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdullah-basfar/r1/',
    portraitUrl: '/images/reciters/abdullah-basfar.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/abdullah-basfar',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.abdurrahmaansudais',
    name: 'عبدالرحمن السديس',
    englishName: 'Abdurrahmaan As-Sudais',
    bio: 'قارئ وإمام سعودي، تتوفر في هذه الصفحة تلاواته القرآنية للاستماع.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Abdul_Rahman_Al-Sudais_-_Cropped.png',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Rahman_Al-Sudais_-_Cropped.png',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Avraham',
  },
  {
    id: 'ar.abdulsamad',
    name: 'عبد الباسط عبد الصمد',
    englishName: 'Abdul Basit',
    bio: 'قارئ مصري من أعلام التلاوة، تتوفر هنا تلاواته المرتلة كاملة.',
    country: 'Egypt',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/',
    portraitUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg/330px-Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Unknown author',
  },
  {
    id: 'ar.mustafa-ismail',
    name: 'مصطفى إسماعيل',
    englishName: 'Mustafa Ismaeel',
    bio: 'قارئ مصري من أعلام التلاوة المجوّدة، تتوفر هنا سور المصحف المجوّد.',
    country: 'Egypt',
    recitationCategory: 'mujawwad',
    honorTier: 'gold',
    recitationStyle: 'المصحف المجود',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mustafa-ismail/r2/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Mostafa_Ismaeel.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Mostafa_Ismaeel.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Riad Shehata',
  },
  {
    id: 'ar.minshawi-mujawwad',
    name: 'محمد صديق المنشاوي',
    englishName: 'Mohamed Siddiq El-Minshawi',
    bio: 'قارئ مصري، تتوفر هنا تلاواته المجوّدة لسور القرآن الكريم.',
    country: 'Egypt',
    recitationCategory: 'mujawwad',
    honorTier: 'gold',
    recitationStyle: 'المصحف المجود',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r2/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Elminshwey.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Elminshwey.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Unknown author',
  },
  {
    id: 'ar.shahat-anwar',
    name: 'الشحات محمد أنور',
    englishName: 'Al-Shahat Mohamed Anwar',
    bio: 'قارئ مصري، تتوفر هنا تسجيلات المصحف الكامل للاستماع.',
    country: 'Egypt',
    recitationCategory: 'murattal',
    recitationStyle: 'المصحف الكامل',
    fullSurahAudioBaseUrl:
      'https://archive.org/download/alshahhat_____--mohammad---anwar----128kb---mp3----quran/',
    portraitUrl: '/images/reciters/al-shahat-muhammad-anwar.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/al-shahat-muhammad-anwar',
    portraitAttribution: 'الطريق إلى القرآن',
    recordingsSourceUrl:
      'https://archive.org/details/alshahhat_____--mohammad---anwar----128kb---mp3----quran',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.mahmoud-shahat-anwar',
    name: 'محمود الشحات أنور',
    englishName: 'Mahmoud El-Shahat Anwar',
    bio: 'قارئ مصري معاصر، تتوفر هنا مجموعة من تلاواته المجوّدة.',
    country: 'Egypt',
    recitationCategory: 'mujawwad',
    recitationStyle: 'تلاوات مجوّدة متفرقة',
    surahAudioUrls: {
      13: archiveAudioUrl(
        '018-s-13',
        '018 s 13  من روائع التلاوات المجودة للشيخ محمود الشحات أنور  سورة الرعد كاملة  تسجيل استوديو.mp3'
      ),
      18: archiveAudioUrl(
        '024-s-18-surah-al-kahf',
        '024 s 18  سورة الكهف كاملة بصوت القارئ محمود الشحات أنور Surah Al-Kahf.mp3'
      ),
      32: archiveAudioUrl(
        '041-s-32',
        '041 s 32 سورة السجدة كاملة من روائع المصحف المجود بصوت محمود الشحات أنور.mp3'
      ),
      36: archiveAudioUrl(
        '048-s-36',
        '048 s 36 سورة يس كاملــــة أستوديو 🎙️ القارئ الشيخ محمود الشحات أنور.mp3'
      ),
      45: archiveAudioUrl(
        '059-s-45-1',
        '059 s 45  محمود الشحات أنور   سورة الجاثية كاملة مع الآيات❤️ تلاوة استوديو 🎤 استماعاً طيبا 🙏 (1).mp3'
      ),
      55: archiveAudioUrl(
        '076-s-55-2020',
        '076 s 55  لأول مرة تلاوة مجودة من سورة الرحمن كاملة (حصرياً)  2020 بصوت القارئ الشيخ محمود الشحات أنور.mp3'
      ),
      66: archiveAudioUrl(
        '091-s-66-2012',
        '091 s 66  استماعآ طيبآ 😢 سورة التحريم كاملة من حفلات فرنسا 🌟ريونيون 2012 محمود الشحات أنور.mp3'
      ),
      78: archiveAudioUrl(
        '107-s-78',
        '107 s 78  من أجمل ما قرأ ✳سورة النبأ ✳  محمود الشحات أنور❊ إندونيسيا ٢٠١٨.mp3'
      ),
      98: archiveAudioUrl(
        '132-s-98-hd',
        '132 s 98  سورة البينة (كاملة) لأول مرة بصوت القارئ محمود الشحات أنور ❊ تلاوة تفوق الوصف ❊_HD.mp3'
      ),
      111: archiveAudioUrl(
        '145-s-111',
        '145 s 111  سورة المسد   القارئ الشيخ محمود الشحات أنور.mp3'
      ),
    },
    recordingsSourceUrl:
      'https://archive.org/search?query=%22%D9%85%D8%AD%D9%85%D9%88%D8%AF%20%D8%A7%D9%84%D8%B4%D8%AD%D8%A7%D8%AA%20%D8%A3%D9%86%D9%88%D8%B1%22',
    ayahAudioEdition: null,
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Mahmoud_El-Shahat_Anwar%2C_Abadan_%281894305%29.jpg/500px-Mahmoud_El-Shahat_Anwar%2C_Abadan_%281894305%29.jpg',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Mahmoud_El-Shahat_Anwar,_Abadan_(1894305).jpg',
    portraitLicense: 'CC BY 4.0',
    portraitAttribution: 'Mohsen Noami Pouran',
  },
  {
    id: 'ar.mahmoud-banna-mujawwad',
    name: 'محمود علي البنا',
    englishName: 'Mahmoud Ali Al-Banna',
    bio: 'قارئ مصري من أعلام التلاوة، تتوفر هنا سور المصحف المجوّد.',
    country: 'Egypt',
    recitationCategory: 'mujawwad',
    honorTier: 'gold',
    recitationStyle: 'المصحف المجود',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mahmoud-banna/r2/',
    portraitUrl: '/images/reciters/mahmoud-ali-al-banna.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/mahmoud-ali-al-banna',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.tablawi-mujawwad',
    name: 'محمد الطبلاوي',
    englishName: 'Mohamed Al-Tablawi',
    bio: 'قارئ مصري من أعلام التلاوة، تتوفر هنا سور المصحف المجوّد.',
    country: 'Egypt',
    recitationCategory: 'mujawwad',
    honorTier: 'gold',
    recitationStyle: 'المصحف المجود',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/muhammad-tablawi/r2/',
    portraitUrl: '/images/reciters/muhammad-mahmoud-al-tablawi.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/muhammad-mahmoud-al-tablawi',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.shaatree',
    name: 'أبو بكر الشاطري',
    englishName: 'Abu Bakr Ash-Shaatree',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة برواية حفص عن عاصم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abubakr-shatri/r1/',
    portraitUrl: '/images/reciters/abu-bakr-al-shatri.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/abu-bakr-al-shatri',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.hanirifai',
    name: 'هاني الرفاعي',
    englishName: 'Hani Rifai',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/hani-rifai/r1/',
    portraitUrl: '/images/reciters/hani-al-rifai.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/hani-al-rifai',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.alafasy',
    name: 'مشاري العفاسي',
    englishName: 'Alafasy',
    bio: 'قارئ ومنشد كويتي، تتوفر هنا تلاواته المرتلة برواية حفص عن عاصم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/',
    portraitUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg/330px-%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    portraitLicense: 'Copyrighted free use',
    portraitAttribution: 'quranic.ru',
  },
  {
    id: 'ar.husary',
    name: 'محمود خليل الحصري',
    englishName: 'Husary',
    bio: 'قارئ مصري من أعلام القراء، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    country: 'Egypt',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Zubairkhan1',
  },
  {
    id: 'ar.hudhaify',
    name: 'علي الحذيفي',
    englishName: 'Hudhaify',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة برواية حفص عن عاصم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Huthaify.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Huthaify.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Km.jahiruddin md. Babur',
  },
  {
    id: 'ar.saud-shuraim',
    name: 'سعود الشريم',
    englishName: 'Saud Al-Shuraim',
    bio: 'إمام وخطيب سابق بالمسجد الحرام، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/saud-shuraim/r1/',
    portraitUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5d/Saud_Shuraim_doing_the_Khutbah.png',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Saud_Shuraim_doing_the_Khutbah.png',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Sobi2203',
  },
  {
    id: 'ar.salah-budair',
    name: 'صلاح البدير',
    englishName: 'Salah Al-Budair',
    bio: 'إمام وخطيب المسجد النبوي، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/salah-budair/r1/',
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Salah_Ibn_Mohammed_Al_Budair.jpg/500px-Salah_Ibn_Mohammed_Al_Budair.jpg',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Salah_Ibn_Mohammed_Al_Budair.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Lafdi93',
  },
  {
    id: 'ar.abdullah-juhani',
    name: 'عبدالله عواد الجهني',
    englishName: 'Abdullah Awad Al-Juhany',
    bio: 'إمام المسجد الحرام، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdullah-juhani/r1/',
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Abdullah_Al_Juhany_%28Cropped%29.png/500px-Abdullah_Al_Juhany_%28Cropped%29.png',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Abdullah_Al_Juhany_(Cropped).png',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'الشيخ هيثم الدخين',
  },
  {
    id: 'ar.khalid-ghamdi',
    name: 'خالد الغامدي',
    englishName: 'Khalid Al-Ghamdi',
    bio: 'إمام سابق للمسجد الحرام، تتوفر هنا مجموعة من تلاواته المرتلة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/khalid-ghamdi/r1/',
    portraitUrl: 'https://www.assabile.com/media/portraits/387-200.webp',
    portraitSourceUrl: 'https://www.assabile.com/khalid-al-ghamdi',
    portraitAttribution: 'Assabile',
  },
  {
    id: 'ar.abdulbari-thubaiti',
    name: 'عبدالباري الثبيتي',
    englishName: 'Abdulbari Al-Thubaity',
    bio: 'إمام وخطيب المسجد النبوي، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulbari-thubaiti/r1/',
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Abdulbari_ath-Thubaity_delivering_sermon_at_Prophet%27s_Mosque_Medina.jpg/500px-Abdulbari_ath-Thubaity_delivering_sermon_at_Prophet%27s_Mosque_Medina.jpg',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Abdulbari_ath-Thubaity_delivering_sermon_at_Prophet%27s_Mosque_Medina.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Unknown author',
  },
  {
    id: 'ar.abdulmohsen-qasim',
    name: 'عبدالمحسن القاسم',
    englishName: 'Abdulmohsen Al-Qasim',
    bio: 'إمام وخطيب المسجد النبوي، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulmohsen-qasim/r1/',
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Abdul_Mohsin_Al-Qasim.jpg/500px-Abdul_Mohsin_Al-Qasim.jpg',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Abdul_Mohsin_Al-Qasim.jpg',
    portraitLicense: 'CC BY 4.0',
    portraitAttribution: 'শেখ শরীফ',
  },
  {
    id: 'ar.ali-jaber',
    name: 'علي جابر',
    englishName: 'Ali Jaber',
    bio: 'إمام وخطيب سابق للمسجد الحرام، تتوفر هنا تلاواته المرتلة كاملة.',
    recitationCategory: 'murattal',
    honorTier: 'gold',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ali-jaber/r1/',
    portraitUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Ali_Jaber_leading_in_Masjid_al-Haram_1988.png/500px-Ali_Jaber_leading_in_Masjid_al-Haram_1988.png',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:Ali_Jaber_leading_in_Masjid_al-Haram_1988.png',
    portraitLicense: 'CC BY-SA 3.0',
    portraitAttribution: 'Unknown author',
  },
  {
    id: 'ar.yasseraldossari',
    name: 'ياسر الدوسري',
    englishName: 'Yasser Al-Dosari',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/yasser-al-dosary.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/yasser-al-dosary',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.nasseralqatami',
    name: 'ناصر القطامي',
    englishName: 'Nasser Al-Qatami',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/nasser-qatami/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/naser-al-katamy.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/naser-al-katamy',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.ahmadnufais',
    name: 'أحمد النفيس',
    englishName: 'Ahmed Al-Nufais',
    bio: 'قارئ كويتي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ahmad-nufais/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/ahmed-al-nafis.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/ahmed-al-nafis',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'ماهر المعيقلي',
    englishName: 'Maher Al-Muaiqly',
    bio: 'قارئ وإمام سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/maher-almaikulai.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/maher-almaikulai',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.idreesabkar',
    name: 'إدريس أبكر',
    englishName: 'Idrees Abkar',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/idrees-abkar/r1/',
    ayahAudioEdition: null,
    portraitUrl: 'https://www.assabile.com/media/portraits/90-200.webp',
    portraitSourceUrl: 'https://www.assabile.com/idris-abkar',
    portraitAttribution: 'Assabile',
  },
  {
    id: 'ar.khalidqahtani',
    name: 'خالد القحطاني',
    englishName: 'Khalid Al-Qahtani',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/khalid-qahtani/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/khalid-al-qahtani.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/khalid-al-qahtani',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.ahmedalajmi',
    name: 'أحمد بن علي العجمي',
    englishName: 'Ahmed Al-Ajmi',
    bio: 'قارئ سعودي، تتوفر هنا تلاواته المرتلة للقرآن الكريم.',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/',
    ayahAudioEdition: null,
    portraitUrl: '/images/reciters/ahmed-al-agamy.jpg',
    portraitSourceUrl: 'https://way2quran.com/ar/reciters/ahmed-al-agamy',
    portraitAttribution: 'الطريق إلى القرآن',
  },
  {
    id: 'ar.abdulrahman-massaad',
    name: 'عبد الرحمن مسعد',
    englishName: 'Abdulrahman Massaad',
    bio: 'قارئ مصري، تتوفر هنا مجموعة مختارة من تلاواته المرتلة.',
    country: 'Egypt',
    recitationCategory: 'murattal',
    honorTier: 'bronze',
    portraitUrl: '/images/reciters/abdulrahman-massaad.jpg',
    portraitSourceUrl:
      'https://www.tvquran.com/ar/scholar/372/profile/%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86-%D9%85%D8%B3%D8%B9%D8%AF',
    portraitAttribution: 'القرآن الكريم تحميل واستماع',
    surahAudioUrls: {
      29: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'العنكبوت.mp3'),
      32: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'السجدة.mp3'),
      49: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'الحجرات.mp3'),
      73: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'المزمل.mp3'),
      78: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'النبأ.mp3'),
      87: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'الأعلى.mp3'),
      88: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'الغاشية.mp3'),
      100: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'العاديات.mp3'),
      107: archiveAudioUrl('abd-al-rahman-musaad-hafs', 'الماعون.mp3'),
    },
    recordingsSourceUrl: 'https://archive.org/details/abd-al-rahman-musaad-hafs',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.mansour-salimi',
    name: 'منصور السالمي',
    englishName: 'Mansour Al-Salmi',
    bio: 'قارئ سعودي، تتوفر تلاواته المرتلة لسور القرآن الكريم.',
    recitationCategory: 'murattal',
    portraitUrl: '/images/reciters/mansour-al-salmi.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Mansurahsalme.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Sarah owis / Wikimedia Commons',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mansour-salimi/r1/',
    recordingsSourceUrl: 'https://mp3quran.net/ar/reciters',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.hazza-balushi',
    name: 'هزاع البلوشي',
    englishName: 'Hazza Al-Balushi',
    bio: 'قارئ عُماني، تتوفر مجموعة من تلاواته المرتلة.',
    recitationCategory: 'murattal',
    portraitUrl: '/images/reciters/hazza-al-balushi.jpg',
    portraitSourceUrl:
      'https://commons.wikimedia.org/wiki/File:%D9%87%D8%B2%D8%A7%D8%B9_%D8%A7%D9%84%D8%A8%D9%84%D9%88%D8%B4%D9%8A.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Ammar molla / Wikimedia Commons',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/hazza-balushi/r1/',
    availableSurahNumbers: [
      1, 6, 8, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 25, 29, 30, 31, 32, 34,
      35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53,
      54, 55, 56, 57, 61, 63, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
      79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
      97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
      112, 113, 114,
    ],
    recordingsSourceUrl: 'https://mp3quran.net/ar/reciters',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.islam-sobhi',
    name: 'إسلام صبحي',
    englishName: 'Islam Sobhi',
    bio: 'قارئ مصري، تتوفر مجموعة من تلاواته المرتلة.',
    country: 'Egypt',
    recitationCategory: 'murattal',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/islam-sobhi/r1/',
    portraitUrl: '/images/reciters/islam-sobhi.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Islam_Sobhi.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Moaz600 / Wikimedia Commons',
    availableSurahNumbers: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 41, 42,
      43, 44, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
      62, 63, 64, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
      81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98,
      99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112,
      113, 114,
    ],
    recordingsSourceUrl: 'https://mp3quran.net/ar/reciters',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.muhammad-ayyub-asif',
    name: 'محمد أيوب عاصف',
    englishName: 'Muhammad Ayyub Asif',
    bio: 'قارئ بريطاني، ستتوفر تلاواته للاستماع قريبًا.',
    recitationCategory: 'murattal',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.jaber-alqaitan',
    name: 'جابر القيطان',
    englishName: 'Jaber Al-Qaitan',
    bio: 'قارئ كويتي، ستتوفر تلاواته للاستماع قريبًا.',
    recitationCategory: 'murattal',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.omar-bin-diaa-aldin',
    name: 'عمر بن ضياء الدين',
    englishName: 'Omar bin Diaa Al-Din',
    bio: 'قارئ مضاف إلى قائمة القراء، وستتوفر تلاواته بعد اعتماد مصدر صوتي موثوق.',
    recitationCategory: 'murattal',
    ayahAudioEdition: null,
  },
];

interface ApiEnvelope<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchApiData<T>(
  path: string,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<T> {
  const response = await fetch(`${QURAN_API_BASE_URL}/${path}`, { signal, cache });
  if (!response.ok) {
    throw new Error(`Quran API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload.code !== 200) {
    throw new Error(`Quran API returned ${payload.status || 'an invalid response'}`);
  }

  return payload.data;
}

export async function fetchSurahList(signal?: AbortSignal): Promise<SurahMeta[]> {
  const surahs = await fetchApiData<SurahMeta[]>('surah', signal);
  if (
    !Array.isArray(surahs) ||
    surahs.length !== 114 ||
    surahs.some((surah, index) => surah.number !== index + 1)
  ) {
    throw new Error('Quran API returned an incomplete or unordered surah list');
  }

  return surahs;
}

export async function fetchSurahText(
  surahNumber: number,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<QuranSurah> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new RangeError('Surah number must be between 1 and 114');
  }

  const surah = await fetchApiData<QuranSurah>(
    `surah/${surahNumber}/quran-uthmani`,
    signal,
    cache
  );
  if (
    surah.number !== surahNumber ||
    !Array.isArray(surah.ayahs) ||
    surah.ayahs.length !== surah.numberOfAyahs ||
    surah.ayahs.some((ayah, index) =>
      ayah.numberInSurah !== index + 1 ||
      !Number.isInteger(ayah.page) ||
      ayah.page < 1 ||
      ayah.page > 604
    )
  ) {
    throw new Error(`Quran API returned incomplete data for surah ${surahNumber}`);
  }

  return surah;
}

export async function searchQuran(
  query: string,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<QuranSearchResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { count: 0, matches: [] };
  }

  const result = await fetchApiData<QuranSearchResult>(
    `search/${encodeURIComponent(trimmedQuery)}/all/quran-uthmani`,
    signal,
    cache
  );
  if (!Array.isArray(result.matches)) {
    throw new Error('Quran API returned an invalid search response');
  }

  return result;
}

export async function fetchSurahAudio(
  surahNumber: number,
  reciterId: string,
  signal?: AbortSignal
): Promise<QuranAudioTrack[]> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new RangeError('Surah number must be between 1 and 114');
  }
  const reciter = QURAN_RECITERS.find((item) => item.id === reciterId);
  if (!reciter) {
    throw new RangeError('Reciter is not in the verified Quran audio collection');
  }
  if (reciter.ayahAudioEdition === null) {
    throw new RangeError('Reciter does not have a verified verse-by-verse audio edition');
  }

  const surah = await fetchApiData<{
    numberOfAyahs: number;
    ayahs: Array<{
      numberInSurah: number;
      audio?: string;
      audioSecondary?: string[];
    }>;
  }>(
    `surah/${surahNumber}/${encodeURIComponent(reciter.ayahAudioEdition ?? reciterId)}`,
    signal
  );

  if (
    !Array.isArray(surah.ayahs) ||
    surah.ayahs.length === 0 ||
    surah.ayahs.length !== surah.numberOfAyahs
  ) {
    throw new Error(`Quran API returned incomplete audio tracks for surah ${surahNumber}`);
  }

  const tracks = surah.ayahs.map((ayah) => {
    const sources = Array.from(new Set([ayah.audio, ...(ayah.audioSecondary ?? [])])).filter(
      (source): source is string => {
        if (!source) return false;

        try {
          return new URL(source).protocol === 'https:';
        } catch {
          return false;
        }
      }
    );

    if (!Number.isInteger(ayah.numberInSurah) || sources.length === 0) {
      throw new Error(`Quran API returned an invalid audio track for surah ${surahNumber}`);
    }

    return { numberInSurah: ayah.numberInSurah, sources };
  });

  if (tracks.some((track, index) => track.numberInSurah !== index + 1)) {
    throw new Error(`Quran API returned unordered audio tracks for surah ${surahNumber}`);
  }

  return tracks;
}
