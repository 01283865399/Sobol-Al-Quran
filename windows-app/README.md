# تطبيق سُبُل لويندوز

هذا المجلد مخصص لملفات Electron وأدوات تجميع تطبيق ويندوز، بينما تشارك الواجهة مع موقع React في جذر المشروع.

- `desktop/`: نقطة تشغيل Electron والخادم المحلي.
- `scripts/`: تجميع الدوال وإنشاء مُثبّت Windows.
- `dist-electron/`: ملفات API المجمعة أثناء البناء (مجلد مولّد).
- `release/`: المثبّت وملفات الإصدار (مجلد مولّد).

من جذر المشروع شغّل `npm run desktop:dev` للتطوير أو `npm run desktop:pack` لإنشاء المثبّت.
رتّبت ملفات التسليم في `%USERPROFILE%/Downloads/Sobul-Windows-App/`:

- ملف `Sobul Quran Setup 0.1.0.exe` هو المثبّت المطلوب للتنزيل والتثبيت.
- `latest.yml` وملف `blockmap` بجوار المثبّت لبيانات الإصدار.
- `Source/windows-app/` و`Sobul-Windows-App-Source.zip` يحتويان ملفات Electron وسكربتات البناء مفصولة عن مصدر الموقع.
- `Build Logs/` يحتوي سجل أداة إنشاء المثبّت، وليس مطلوبًا للتثبيت.
