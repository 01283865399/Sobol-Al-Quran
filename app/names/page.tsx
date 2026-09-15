'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { Sparkles, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { asmaUlHusna } from '@/lib/islamic-data';

const allNames = [
  ...asmaUlHusna,
  { number: 31, name: 'الخَبِيرُ', transliteration: 'Al-Khabir', meaning: 'العالم بحقائق الأمور' },
  { number: 32, name: 'الحَلِيمُ', transliteration: 'Al-Haleem', meaning: 'الذي لا يعاجل بالعقوبة' },
  { number: 33, name: 'العَظِيمُ', transliteration: 'Al-Azeem', meaning: 'ذو العظمة في كل صفاته' },
  { number: 34, name: 'الغَفُورُ', transliteration: 'Al-Ghafoor', meaning: 'كثير المغفرة' },
  { number: 35, name: 'الشَّكُورُ', transliteration: 'Ash-Shakoor', meaning: 'الذي يشكر القليل بالجزيل' },
  { number: 36, name: 'العَلِيُّ', transliteration: "Al-'Alee", meaning: 'العالي فوق كل شيء' },
  { number: 37, name: 'الكَبِيرُ', transliteration: 'Al-Kabeer', meaning: 'الكبير المتعال' },
  { number: 38, name: 'الحَفِيظُ', transliteration: 'Al-Hafeez', meaning: 'الحافظ لكل شيء' },
  { number: 39, name: 'المُقِيتُ', transliteration: 'Al-Muqeet', meaning: 'المقتدر على كل شيء' },
  { number: 40, name: 'الحَسِيبُ', transliteration: 'Al-Haseeb', meaning: 'الكافي عباده' },
  { number: 41, name: 'الجَلِيلُ', transliteration: 'Al-Jaleel', meaning: 'صاحب الجلال' },
  { number: 42, name: 'الكَرِيمُ', transliteration: 'Al-Kareem', meaning: 'كثير الخير' },
  { number: 43, name: 'الرَّقِيبُ', transliteration: 'Ar-Raqeeb', meaning: 'الحافظ المراقب' },
  { number: 44, name: 'المُجِيبُ', transliteration: 'Al-Mujeeb', meaning: 'مجيب الدعاء' },
  { number: 45, name: 'الوَاسِعُ', transliteration: 'Al-Wasi', meaning: 'الذي وسع كل شيء' },
  { number: 46, name: 'الحَكِيمُ', transliteration: 'Al-Hakeem', meaning: 'الحكيم في أفعاله' },
  { number: 47, name: 'الوَدُودُ', transliteration: 'Al-Wadood', meaning: 'المحب لعباده' },
  { number: 48, name: 'المَجِيدُ', transliteration: 'Al-Majeed', meaning: 'العظيم الشأن' },
  { number: 49, name: 'البَاعِثُ', transliteration: 'Al-Baith', meaning: 'باعث الخلق يوم القيامة' },
  { number: 50, name: 'الشَّهِيدُ', transliteration: 'Ash-Shaheed', meaning: 'الشاهد على كل شيء' },
  { number: 51, name: 'الحَقُّ', transliteration: 'Al-Haqq', meaning: 'الموجود الثابت' },
  { number: 52, name: 'الوَكِيلُ', transliteration: 'Al-Wakeel', meaning: 'المتكفل بأمور خلقه' },
  { number: 53, name: 'القَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'صاحب القوة' },
  { number: 54, name: 'المَتِينُ', transliteration: 'Al-Mateen', meaning: 'الشديد القوي' },
  { number: 55, name: 'الوَلِيُّ', transliteration: 'Al-Waliyy', meaning: 'نصير المؤمنين' },
  { number: 56, name: 'الحَمِيدُ', transliteration: 'Al-Hameed', meaning: 'المستحق للحمد' },
  { number: 57, name: 'المُحْصِي', transliteration: 'Al-Muhsi', meaning: 'الذي أحصى كل شيء' },
  { number: 58, name: 'المُبْدِئُ', transliteration: 'Al-Mubdi', meaning: 'الذي أنشأ الأشياء' },
  { number: 59, name: 'المُعِيدُ', transliteration: "Al-Mu'id", meaning: 'الذي يعيد الخلق' },
  { number: 60, name: 'المُحْيِي', transliteration: 'Al-Muhyi', meaning: 'محيي الموتى' },
  { number: 61, name: 'المُمِيتُ', transliteration: 'Al-Mumeet', meaning: 'الذي يميت الأحياء' },
  { number: 62, name: 'الحَيُّ', transliteration: 'Al-Hayy', meaning: 'الباقي الذي لا يموت' },
  { number: 63, name: 'القَيُّومُ', transliteration: 'Al-Qayyum', meaning: 'القائم بنفسه' },
  { number: 64, name: 'الوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'الذي لا يحتاج' },
  { number: 65, name: 'المَاجِدُ', transliteration: 'Al-Majid', meaning: 'كثير الخير الكريم' },
  { number: 66, name: 'الوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'الفرد في ذاته' },
  { number: 67, name: 'الأَحَدُ', transliteration: 'Al-Ahad', meaning: 'الواحد الذي لا ثاني له' },
  { number: 68, name: 'الصَّمَدُ', transliteration: 'As-Samad', meaning: 'السيدي الذي يُقصد في الحوائج' },
  { number: 69, name: 'القَادِرُ', transliteration: 'Al-Qadir', meaning: 'ذو القدرة' },
  { number: 70, name: 'المُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'المقتدر على كل شيء' },
  { number: 71, name: 'المُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'الذي يقدم الأشياء' },
  { number: 72, name: 'المُؤَخِّرُ', transliteration: "Al-Mu'akhkhir", meaning: 'الذي يؤخر الأشياء' },
  { number: 73, name: 'الأَوَّلُ', transliteration: "Al-Awwal", meaning: 'الذي ليس قبله شيء' },
  { number: 74, name: 'الآخِرُ', transliteration: 'Al-Akhir', meaning: 'الذي ليس بعده شيء' },
  { number: 75, name: 'الظَّاهِرُ', transliteration: 'Az-Zahir', meaning: 'الظاهر بالدلائل' },
  { number: 76, name: 'البَاطِنُ', transliteration: 'Al-Batin', meaning: 'المستور عن العيون' },
  { number: 77, name: 'الوَالِي', transliteration: 'Al-Wali', meaning: 'المالك المتصرف' },
  { number: 78, name: 'المُتَعَالِي', transliteration: 'Al-Mutaali', meaning: 'العالي عن كل شيء' },
  { number: 79, name: 'البَرُّ', transliteration: 'Al-Barr', meaning: 'كثير الخير والإحسان' },
  { number: 80, name: 'التَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'الذي يقبل التوبة' },
  { number: 81, name: 'المُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'الذي ينتقم من العصاة' },
  { number: 82, name: 'العَفُوُّ', transliteration: "Al-'Afuww", meaning: 'كثير العفو' },
  { number: 83, name: 'الرَّؤُوفُ', transliteration: 'Ar-Rauf', meaning: 'الرحيم بعباده' },
  { number: 84, name: 'مَالِكُ المُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'المتصرف في الملك' },
  { number: 85, name: 'ذُو الجَلَالِ وَالإِكْرَامِ', transliteration: 'Dhul-Jalali wal-Ikram', meaning: 'صاحب العظمة والكرم' },
  { number: 86, name: 'المُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'العادل في حكمه' },
  { number: 87, name: 'الجَامِعُ', transliteration: 'Al-Jami', meaning: 'جامع الناس ليوم القيامة' },
  { number: 88, name: 'الغَنِيُّ', transliteration: 'Al-Ghaniyy', meaning: 'الذي لا يحتاج لشيء' },
  { number: 89, name: 'المُغْنِي', transliteration: 'Al-Mughni', meaning: 'الذي يغني عباده' },
  { number: 90, name: 'المَانِعُ', transliteration: 'Al-Mani', meaning: 'الذي يمنع من يشاء' },
  { number: 91, name: 'الضَّارُّ', transliteration: 'Ad-Darr', meaning: 'الذي يضر من يشاء' },
  { number: 92, name: 'النَّافِعُ', transliteration: 'An-Nafi', meaning: 'الذي ينفع من يشاء' },
  { number: 93, name: 'النُّورُ', transliteration: 'An-Noor', meaning: 'منور السماوات والأرض' },
  { number: 94, name: 'الهَادِي', transliteration: 'Al-Hadi', meaning: 'الذي يهدي عباده' },
  { number: 95, name: 'البَدِيعُ', transliteration: 'Al-Badi', meaning: 'مبدع الكون على غير مثال' },
  { number: 96, name: 'البَاقِي', transliteration: 'Al-Baqi', meaning: 'الدائم الوجود' },
  { number: 97, name: 'الوَارِثُ', transliteration: 'Al-Warith', meaning: 'الباقي بعد فناء خلقه' },
  { number: 98, name: 'الرَّشِيدُ', transliteration: 'Ar-Rasheed', meaning: 'الحسن التدبير' },
  { number: 99, name: 'الصَّبُورُ', transliteration: 'As-Saboor', meaning: 'الذي لا يعجل بالعقوبة' },
];

export default function NamesPage() {
  const [search, setSearch] = React.useState('');

  const filtered = allNames.filter(
    (n) =>
      n.name.includes(search) ||
      n.transliteration.toLowerCase().includes(search.toLowerCase()) ||
      n.meaning.includes(search)
  );

  return (
    <PageLayout>
      <PageHeader
        title="أسماء الله الحسنى"
        subtitle="التسعة والتسعون اسمًا لله سبحانه وتعالى مع الشرح والمعنى"
        icon={<Sparkles className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-8">
          <p className="font-amiri text-2xl text-accent mb-2">
            وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
          </p>
          <p className="text-sm text-muted-foreground font-cairo">سورة الأعراف - الآية 180</p>
        </div>

        <div className="relative max-w-xl mx-auto mb-10">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن اسم الله الحسنى..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 font-cairo"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((name, index) => (
            <div
              key={name.number}
              className="group bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 0.02, 1)}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full text-accent/30" fill="none">
                    <path d="M24 2 L30 10 L44 12 L34 22 L36 36 L24 30 L12 36 L14 22 L4 12 L18 10 Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="relative font-kufi text-sm font-bold text-accent">{name.number}</span>
                </div>
                <div>
                  <h3 className="font-amiri text-2xl text-primary group-hover:text-accent transition-colors mb-1">
                    {name.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-cairo mb-1">{name.transliteration}</p>
                  <p className="text-sm text-foreground/80 font-cairo">{name.meaning}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
