# سُبُل

تطبيق React مبني باستخدام Vite، ويستخدم React Router للتنقل. واجهات الخادم تعمل على Netlify Functions أو Vercel Functions.

## التشغيل المحلي

```bash
npm ci
npm run dev
```

يفتح Vite الموقع محليًا، وتعمل الدوال عبر `/api/chat` و`/api/radio` و`/api/media/...`.
لتفعيل ردود المساعد، أضف `GEMINI_API_KEY` إلى متغيرات بيئة الخادم أو ملف `.env` المحلي؛ لا تستخدم بادئة `VITE_` للمفاتيح السرية.

## البناء والمعاينة

```bash
npm run build
npm run preview
```

ينتج البناء ملفات الموقع في `dist`.

- إعداد Netlify موجود في `netlify.toml`، ويحدد نشر `dist` ودوال `netlify/functions`.
- إعداد Vercel موجود في `vercel.json`، ويحدد Vite ومجلد `dist`، مع واجهات الخادم في `api/` وإعادة توجيه مسارات React Router إلى التطبيق.
- لتفعيل المحادثة على Vercel، أضف `GEMINI_API_KEY` في إعدادات المشروع ضمن Environment Variables، وحدد بيئة Production، ثم أعد النشر. لا تضع المفتاح في متغير يبدأ بـ `VITE_` أو في ملفات الواجهة.

## تطبيق ويندوز

ملفات تطبيق سطح المكتب وتجميعه موجودة بشكل منفصل في `windows-app/`.

لتشغيل نسخة سطح المكتب أثناء التطوير:

```bash
npm run desktop:dev
```

لإنشاء مُثبّت Windows x64 بصيغة NSIS:

```bash
npm run desktop:pack
```

تُحفظ ملفات البناء والمثبّت داخل `windows-app/release/`. التطبيق يشغّل واجهة الموقع ودواله محليًا، ويحتاج اتصالًا بالإنترنت للمحتوى والخدمات الخارجية. لتفعيل ردود المساعد، أنشئ ملف `%APPDATA%/sobul-quran/.env` واكتب فيه `GEMINI_API_KEY=...`، أو عيّن المتغير في بيئة النظام. لا تُضمّن المفتاح في ملفات الواجهة أو في عملية البناء.

ملفات تطبيق ويندوز المنفصلة والمثبّت الحالي موجودة في `%USERPROFILE%/Downloads/Sobul-Windows-App/`.
