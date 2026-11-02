# إصلاح نسخة GitHub Pages — TAHWELATY

## التشخيص

راجعت صفحة الموقع والمستودع العام بتاريخ 29 أكتوبر 2026. ملف البيانات في فرع `main` ما زال يحتوي على `DEMO_BALANCE = 12450`، بينما النسخة الحالية من المشروع تعرض صفرًا. كما أن Workflow القديم يغيّر مسارات أسماء قديمة مثل `public/manifest.json` و`apple-touch-icon.png`، في حين أن ملفات النسخة الحالية هي `public/manifest.webmanifest` و`public/icons/apple-touch-icon.png`. كذلك فإن روابط الصور المطلقة من الجذر مثل `/images/...` و`/icons/...` لا تشير إلى مجلد المستودع عند النشر على `https://eslameltohami.github.io/tahwelaty/`.

الـWorkflow القديم انتهى بنجاح، لكن نجاح البناء وحده لا يعني أن المستودع يحتوي على أحدث ملفات التطبيق. لذلك قد ينشر GitHub Pages نسخة قديمة أو واجهة تظهر فيها الصور مفقودة.

## ما يتضمنه الإصلاح

- قيمة base path مرنة: معاينة Manus تعمل من جذر الموقع، وGitHub Pages يعمل داخل `/tahwelaty/`.
- روابط صورة البداية والأيقونات وManifest وService Worker تتبع بادئة الموقع.
- Manifest يستخدم مسارات نسبية لتعمل الأيقونات و`start_url` و`scope` داخل مجلد المستودع.
- `.github/workflows/deploy.yml` يبني نسخة Expo Web الحالية إلى `dist`، ويضيف `.nojekyll` وملف fallback، ثم ينشر عبر GitHub Pages Actions.
- تبقى واجهات الدفع تجريبية، والرصيد صفر؛ لا يتصل التطبيق بمزود دفع.
- بُني تصدير Pages وفُحص محليًا تحت المسار `/tahwelaty/`؛ ظهرت الأيقونة والصور وعمل التنقل في تبويبي التحويل والفواتير.

## تحديث مستودع GitHub

المستودع العام غير مربوط بحساب GitHub مصرح به في هذه الجلسة، لذلك **لم أرفع التغييرات إلى `main` ولم يتغير الموقع العام تلقائيًا**. يجب نقل المصدر المصحح إلى مستودعك وتشغيل Workflow حتى يظهر الإصلاح على الرابط العام.

### خطوات التطبيق باستخدام GitHub Desktop

1. نزّل أرشيف المصدر وفك ضغطه.
2. افتح GitHub Desktop واختر **File → Clone Repository**، ثم استنسخ `eslameltohami/tahwelaty` إلى جهازك.
3. داخل مجلد النسخة المستنسخة، احذف ملفات المشروع القديمة مع الإبقاء على مجلد `.git`، ثم انسخ محتويات الأرشيف الجديدة كلها مكانها. تأكد من نسخ المجلد المخفي `.github/workflows/` أيضًا.
4. في GitHub Desktop اكتب ملخصًا مثل `Fix GitHub Pages asset paths`، ثم اختر **Commit to main** وبعده **Push origin**.
5. من المستودع افتح **Settings → Pages** وتأكد أن مصدر النشر هو **GitHub Actions**. بعد الدفع افتح **Actions** وانتظر نجاح **Deploy TAHWELATY to GitHub Pages**.
6. بعد نجاح النشر، افتح الموقع في نافذة خاصة أو أعد تحميله دون Cache وتحقق من الأيقونات والرصيد الصفري.

لا تعدّل يدويًا مسارات `/tahwelaty` في الملفات؛ Workflow يكتشف اسم المستودع ويضبط البادئة تلقائيًا.

## روابط الفحص

- صفحة النشر: <https://eslameltohami.github.io/tahwelaty/>
- Workflow الحالي وقت التشخيص: <https://github.com/eslameltohami/tahwelaty/blob/main/.github/workflows/deploy.yml>
- بيانات الرصيد الحالية في المستودع وقت التشخيص: <https://github.com/eslameltohami/tahwelaty/blob/main/components/tahwelaty/data.ts>
- سجل عمليات Actions: <https://github.com/eslameltohami/tahwelaty/actions/workflows/deploy.yml>
