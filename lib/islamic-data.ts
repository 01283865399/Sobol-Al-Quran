export interface QuranVerse {
  text: string;
  surah: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface Hadith {
  text: string;
  narrator: string;
  source: string;
  grade: string;
}

export interface Dhikr {
  text: string;
  count: string;
  virtue: string;
}

export interface AsmaUlHusna {
  number: number;
  name: string;
  transliteration: string;
  meaning: string;
}

export const rotatingVerses: QuranVerse[] = [
  {
    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    surah: 'طه',
    surahNumber: 20,
    ayahNumber: 114,
  },
  {
    text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    surah: 'الشرح',
    surahNumber: 94,
    ayahNumber: 6,
  },
  {
    text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    surah: 'الطلاق',
    surahNumber: 65,
    ayahNumber: 2,
  },
  {
    text: 'وَبَشِّرِ الصَّابِرِينَ',
    surah: 'البقرة',
    surahNumber: 2,
    ayahNumber: 155,
  },
  {
    text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    surah: 'البقرة',
    surahNumber: 2,
    ayahNumber: 152,
  },
  {
    text: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    surah: 'البقرة',
    surahNumber: 2,
    ayahNumber: 153,
  },
  {
    text: 'وَهُوَ مَعَكُمْ أَيْنَمَا كُنتُمْ',
    surah: 'الحديد',
    surahNumber: 57,
    ayahNumber: 4,
  },
  {
    text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
    surah: 'البقرة',
    surahNumber: 2,
    ayahNumber: 201,
  },
];

export const asmaUlHusna: AsmaUlHusna[] = [
  { number: 1, name: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'الرحيم بجميع خلقه' },
  { number: 2, name: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'الرحيم بالمؤمنين' },
  { number: 3, name: 'المَلِكُ', transliteration: 'Al-Malik', meaning: 'المالك لكل شيء' },
  { number: 4, name: 'القُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'المنزه عن كل نقص' },
  { number: 5, name: 'السَّلامُ', transliteration: 'As-Salam', meaning: 'السالم من كل عيب' },
  { number: 6, name: 'المُؤْمِنُ', transliteration: "Al-Mu'min", meaning: 'المصدِّق رسالته' },
  { number: 7, name: 'المُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'الرقيب على كل شيء' },
  { number: 8, name: 'العَزِيزُ', transliteration: 'Al-Aziz', meaning: 'القوي الذي لا يُغلب' },
  { number: 9, name: 'الجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'القاهر فوق عباده' },
  { number: 10, name: 'المُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'العظيم المتنزه' },
  { number: 11, name: 'الخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'موجد الأشياء من العدم' },
  { number: 12, name: 'البَارِئُ', transliteration: 'Al-Bari', meaning: 'الخالق المنشئ' },
  { number: 13, name: 'المُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'مصور المخلوقات' },
  { number: 14, name: 'الغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'كثير المغفرة' },
  { number: 15, name: 'القَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'الغالب على كل شيء' },
  { number: 16, name: 'الوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'كثير العطاء بلا مقابل' },
  { number: 17, name: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'الذي يرزق جميع خلقه' },
  { number: 18, name: 'الفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'الذي يفتح أبواب الرحمة' },
  { number: 19, name: 'العَلِيمُ', transliteration: "Al-'Aleem", meaning: 'العليم بكل شيء' },
  { number: 20, name: 'القَابِضُ', transliteration: 'Al-Qabid', meaning: 'الذي يقبض الأرزاق' },
  { number: 21, name: 'البَاسِطُ', transliteration: 'Al-Basit', meaning: 'الذي يبسط الرزق' },
  { number: 22, name: 'الخَافِضُ', transliteration: 'Al-Khafid', meaning: 'الذي يخفض من يشاء' },
  { number: 23, name: 'الرَّافِعُ', transliteration: 'Ar-Rafi', meaning: 'الذي يرفع من يشاء' },
  { number: 24, name: 'المُعِزُّ', transliteration: "Al-Mu'izz", meaning: 'الذي يعز من يشاء' },
  { number: 25, name: 'المُذِلُّ', transliteration: 'Al-Mudhill', meaning: 'الذي يذل من يشاء' },
  { number: 26, name: 'السَّمِيعُ', transliteration: 'As-Sami', meaning: 'السامع لكل شيء' },
  { number: 27, name: 'البَصِيرُ', transliteration: 'Al-Basir', meaning: 'البصير بكل شيء' },
  { number: 28, name: 'الحَكَمُ', transliteration: 'Al-Hakam', meaning: 'الحاكم بين عباده' },
  { number: 29, name: 'العَدْلُ', transliteration: "Al-'Adl", meaning: 'العادل في حكمه' },
  { number: 30, name: 'اللَّطِيفُ', transliteration: 'Al-Latif', meaning: 'الرفيق بعباده' },
];

export const hadithOfTheDay: Hadith = {
  text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
  narrator: 'عمر بن الخطاب رضي الله عنه',
  source: 'صحيح البخاري - رقم 1',
  grade: 'صحيح',
};

export const dhikrOfTheDay: Dhikr = {
  text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
  count: '100 مرة',
  virtue: 'من قالها غُفرت ذنوبه وإن كانت مثل زبد البحر',
};

export const verseOfTheDay: QuranVerse = {
  text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
  surah: 'الفاتحة',
  surahNumber: 1,
  ayahNumber: 2,
};

export const prayerNames: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const quickAccessSections = [
  { id: 'quran', title: 'القرآن الكريم', description: 'المصحف الكامل بـ114 سورة', icon: 'BookOpen', href: '/quran' },
  { id: 'hadith', title: 'الحديث الشريف', description: 'البخاري ومسلم والسنن', icon: 'ScrollText', href: '/hadith' },
  { id: 'azkar', title: 'الأذكار والأدعية', description: 'أذكار الصباح والمساء', icon: 'Heart', href: '/azkar' },
  { id: 'tasbih', title: 'السبحة الإلكترونية', description: 'سبحة تفاعلية بتصميم فاخر', icon: 'CircleDot', href: '/tasbih' },
  { id: 'sadaqah', title: 'الصدقة الجارية', description: 'صفحات تبرع باسم المتوفى', icon: 'Bird', href: '/sadaqah' },
  { id: 'tools', title: 'أدوات إسلامية', description: 'زكاة، ميراث، قبلة، تقويم', icon: 'Calculator', href: '/tools' },
  { id: 'names', title: 'أسماء الله الحسنى', description: '99 اسم بالشرح والمعنى', icon: 'Sparkles', href: '/names' },
  { id: 'seerah', title: 'السيرة النبوية', description: 'حياة النبي ﷺ وقصص الأنبياء', icon: 'BookMarked', href: '/seerah' },
];

export const siteStats = [
  { label: 'سورة قرآنية', value: '114', icon: 'BookOpen' },
  { label: 'حديث شريف', value: '40,000+', icon: 'ScrollText' },
  { label: 'ذكر ودعاء', value: '500+', icon: 'Heart' },
  { label: 'مستخدم نشط', value: '100,000+', icon: 'Users' },
];

export const prayerInfo = [
  { name: 'الفجر', time: '04:32', icon: 'sunrise' as const },
  { name: 'الشروق', time: '06:05', icon: 'sun' as const },
  { name: 'الظهر', time: '12:18', icon: 'sun' as const },
  { name: 'العصر', time: '15:42', icon: 'sun' as const },
  { name: 'المغرب', time: '18:31', icon: 'sunset' as const },
  { name: 'العشاء', time: '20:01', icon: 'moon' as const },
];
