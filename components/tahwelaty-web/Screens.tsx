import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  billCategories,
  billers,
  collectionProviderExamples,
  DEMO_BALANCE,
  maskSensitiveTarget,
  type BillCategory,
  type DemoAction,
  type DemoTransaction,
  type TabId,
} from "@/components/tahwelaty/data";
import { ActionButton, Field, Icon, InlineNotice, Panel, Pill, ScreenHeading, TextAreaField, type WebIconName } from "./ui";

const formatMoney = (amount: number) => amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Content({ children }: { children: ReactNode }) {
  return <div className="tw-content">{children}</div>;
}

function SectionHeader({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="tw-section-heading">
      <div><h2>{title}</h2>{hint ? <p>{hint}</p> : null}</div>
      {action}
    </div>
  );
}

function QuickAction({ title, subtitle, icon, tone, onClick }: { title: string; subtitle: string; icon: "swap-horizontal-outline" | "receipt-outline" | "headset-outline" | "shield-checkmark-outline"; tone: string; onClick: () => void }) {
  return (
    <button type="button" className={`tw-quick-action tw-quick-action--${tone}`} onClick={onClick} aria-label={`${title}: ${subtitle}`}>
      <span className="tw-quick-action__icon"><Icon name={icon} size={22} /></span>
      <span className="tw-quick-action__copy"><strong>{title}</strong><small>{subtitle}</small></span>
      <Icon name="chevron-back" size={17} />
    </button>
  );
}

export function HomeScreen({ onNavigate, balanceVisible, onToggleBalance, transactions, onOpenReceipt }: {
  onNavigate: (tab: TabId) => void;
  balanceVisible: boolean;
  onToggleBalance: () => void;
  transactions: DemoTransaction[];
  onOpenReceipt: (transaction: DemoTransaction) => void;
}) {
  return (
    <Content>
      <div className="tw-welcome-row">
        <div><p className="tw-eyebrow">محفظتك الرقمية — وضع تجريبي</p><h1>فلوسك في لمحة</h1><p className="tw-subtitle">استكشف تجربة تحويل ودفع، بدون معاملات مالية حقيقية.</p></div>
        <Pill tone="red">لا توجد مدفوعات حقيقية</Pill>
      </div>

      <Panel className="tw-balance-card">
        <div className="tw-balance-glow" aria-hidden="true" />
        <div className="tw-balance-top"><span>الرصيد التجريبي</span><button className="tw-icon-button" type="button" onClick={onToggleBalance} aria-label={balanceVisible ? "إخفاء الرصيد التجريبي" : "إظهار الرصيد التجريبي"}><Icon name={balanceVisible ? "eye-outline" : "eye-off-outline"} color="var(--gold)" size={20} /></button></div>
        <p className="tw-balance-amount">{balanceVisible ? `${formatMoney(DEMO_BALANCE)} ج.م` : "•••••• ج.م"}</p>
        <div className="tw-balance-bottom"><span>قيمة افتراضية للعرض فقط</span><span className="tw-demo-ref">DEMO</span></div>
      </Panel>

      <section className="tw-section">
        <SectionHeader title="ابدأ من هنا" hint="كل الخيارات تجريبية" />
        <div className="tw-quick-grid">
          <QuickAction title="تحويل تجريبي" subtitle="عاين خطوات التحويل" icon="swap-horizontal-outline" tone="teal" onClick={() => onNavigate("pay")} />
          <QuickAction title="دفع الفواتير" subtitle="غاز، كهرباء، مياه واتصالات" icon="receipt-outline" tone="gold" onClick={() => onNavigate("pay")} />
          <QuickAction title="الحماية" subtitle="PIN محلي تجريبي" icon="shield-checkmark-outline" tone="blue" onClick={() => onNavigate("security")} />
          <QuickAction title="الدعم والشكاوى" subtitle="نموذج محلي غير مُرسل" icon="headset-outline" tone="pink" onClick={() => onNavigate("support")} />
        </div>
      </section>

      <InlineNotice tone="warning">لا تدخل بيانات بطاقتك أو كلمة مرور محفظتك. هذه النسخة لا تتصل بأي بنك أو شركة تحصيل.</InlineNotice>

      <section className="tw-section">
        <SectionHeader title="آخر ما عاينته" action={<button type="button" className="tw-text-button" onClick={() => onNavigate("history")}>عرض السجل</button>} />
        {transactions.length === 0 ? (
          <Panel className="tw-empty-panel"><span className="tw-empty-icon"><Icon name="time-outline" size={22} /></span><strong>لا توجد محاكاة بعد</strong><p>عند تجربة التدفق، سيظهر سجل مؤقت محلي مع تنبيه واضح بأنه غير حقيقي.</p></Panel>
        ) : <div className="tw-list">{transactions.slice(0, 3).map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onClick={() => onOpenReceipt(transaction)} />)}</div>}
      </section>
    </Content>
  );
}

export function TransactionRow({ transaction, onClick }: { transaction: DemoTransaction; onClick: () => void }) {
  return (
    <button type="button" className="tw-transaction-row" onClick={onClick} aria-label={`عرض تفاصيل ${transaction.kind} تجريبي`}>
      <span className="tw-transaction-icon"><Icon name={transaction.kind.includes("فاتورة") ? "receipt-outline" : "swap-horizontal-outline"} color="var(--teal)" size={19} /></span>
      <span className="tw-transaction-info"><strong>{transaction.service}</strong><small>{transaction.target} · {transaction.date}</small></span>
      <span className="tw-transaction-amount"><strong>{formatMoney(transaction.amount)} ج.م</strong><small>محاكاة</small></span>
    </button>
  );
}

function parseDemoAmount(value: string): number | null {
  const normalized = value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/,/g, ".")
    .replace(/\s/g, "");
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export function TransferScreen({ onContinue }: { onContinue: (action: DemoAction) => void }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const number = parseDemoAmount(amount);
  const cleanPhone = normalizeDigits(phone.trim()).replace(/[\s-]/g, "");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) { setError("أدخل رقم هاتف مصريًا مكوّنًا من 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015."); return; }
    if (number === null) { setError("أدخل مبلغًا موجبًا، وبحد أقصى منزلتين عشريتين."); return; }
    setError("");
    onContinue({ kind: "تحويل تجريبي", service: "تحويل محلي (غير مربوط)", target: maskSensitiveTarget(cleanPhone), amount: number });
    setPhone(""); setAmount("");
  };

  return (
    <Content>
      <ScreenHeading eyebrow="تحويل الأموال" title="عاين خطوات التحويل" subtitle="لن يتم إرسال أموال أو بيانات إلى أي جهة. أدخل بيانات اختبار غير حساسة فقط." />
      <InlineNotice tone="warning">لا تستخدم رقمًا أو بيانات تخص شخصًا آخر. المتابعة تنشئ سجل محاكاة محليًا فقط، ولا تخصم من الرصيد.</InlineNotice>
      <Panel>
        <div className="tw-card-heading"><h2>معلومات المستلم</h2><Pill tone="muted">تجريبي فقط</Pill></div>
        <form className="tw-form" onSubmit={submit} noValidate>
          <Field label="رقم الهاتف / المحفظة" value={phone} onValueChange={(value) => { setPhone(value); setError(""); }} placeholder="01xxxxxxxxx" type="tel" inputMode="tel" autoComplete="off" maxLength={16} aria-label="رقم هاتف اختبار للمستلم" dir="ltr" />
          <Field label="المبلغ الافتراضي (جنيه مصري)" value={amount} onValueChange={(value) => { setAmount(value); setError(""); }} placeholder="0.00" inputMode="decimal" autoComplete="off" aria-label="مبلغ افتراضي للمحاكاة" dir="ltr" />
          <div className="tw-provider-disabled"><span className="tw-provider-disabled__icon"><Icon name="link-outline" color="var(--gold)" /></span><div><strong>مزود التحويل</strong><small>غير محدد — بانتظار شريك مرخّص وواجهة API</small></div><Pill tone="red">غير مفعّل</Pill></div>
          {error ? <p className="tw-error" role="alert">{error}</p> : null}
          <ActionButton type="submit" title="متابعة إلى التحقق التجريبي" icon="shield-checkmark-outline" />
          <p className="tw-helper">المبلغ والرصيد المعروضين تجريبيان، ولا يحدث خصم أو تسوية.</p>
        </form>
      </Panel>
      <Panel className="tw-note-panel"><h2>ما الذي سيحدث؟</h2><p>ستجرب شاشة التحقق المحلية برمز PIN مؤقت. بعد ذلك قد يظهر إيصال محاكاة معلّم بوضوح بأنه غير صالح كإثبات دفع.</p></Panel>
    </Content>
  );
}

export function BillsScreen({ onContinue }: { onContinue: (action: DemoAction) => void }) {
  const [category, setCategory] = useState<BillCategory>("gas");
  const [biller, setBiller] = useState(billers.gas[0]);
  const [subscriber, setSubscriber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const number = parseDemoAmount(amount);
  const list = billers[category];
  const selectCategory = (next: BillCategory) => { setCategory(next); setBiller(billers[next][0]); setError(""); };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSubscriber = normalizeDigits(subscriber.trim());
    if (!/^\d{4,32}$/.test(normalizedSubscriber)) { setError("أدخل رقم مشترك تجريبيًا من 4 إلى 32 رقمًا، من دون حروف أو رموز."); return; }
    if (number === null) { setError("أدخل مبلغًا موجبًا، وبحد أقصى منزلتين عشريتين."); return; }
    setError("");
    onContinue({ kind: "سداد فاتورة تجريبي", service: biller, target: maskSensitiveTarget(`رقم مشترك تجريبي: ${normalizedSubscriber}`), amount: number });
    setSubscriber(""); setAmount("");
  };

  return (
    <Content>
      <ScreenHeading eyebrow="خدمات منزلية" title="الفواتير والخدمات" subtitle="أسماء الجهات أمثلة واقعية للتصميم فقط. لا يوجد استعلام أو سداد متصل بها." />
      <InlineNotice tone="warning">اختيار شركة هنا لا يعني وجود عقد أو تكامل معها، ولن تُرسل بيانات رقم العداد أو المشترك إلى أي جهة.</InlineNotice>
      <div className="tw-category-grid" role="group" aria-label="تصنيف الفاتورة">
        {billCategories.map((item) => <button key={item.id} type="button" className={`tw-category-card ${category === item.id ? "is-selected" : ""}`} style={{ "--category-accent": item.accent } as CSSProperties} onClick={() => selectCategory(item.id)} aria-pressed={category === item.id}><Icon name={item.icon as WebIconName} size={21} /><span>{item.title}</span></button>)}
      </div>
      <Panel>
        <h2>اختر الشركة المزودة للخدمة</h2>
        <div className="tw-biller-list" role="radiogroup" aria-label="الشركة المزودة للخدمة">
          {list.map((name) => <button key={name} type="button" className={`tw-biller-option ${biller === name ? "is-selected" : ""}`} role="radio" aria-checked={biller === name} onClick={() => { setBiller(name); setError(""); }}><span className="tw-radio-dot" />{name}</button>)}
        </div>
        <form className="tw-form" onSubmit={submit} noValidate>
          <Field label="رقم المشترك أو العداد (بيانات اختبار فقط)" value={subscriber} onValueChange={(value) => { setSubscriber(value); setError(""); }} placeholder="أدخل رقمًا وهميًا للتجربة" inputMode="numeric" maxLength={32} autoComplete="off" aria-label="رقم مشترك تجريبي" dir="ltr" />
          <Field label="المبلغ الافتراضي (جنيه مصري)" value={amount} onValueChange={(value) => { setAmount(value); setError(""); }} placeholder="0.00" inputMode="decimal" autoComplete="off" aria-label="مبلغ فاتورة افتراضي للمحاكاة" dir="ltr" />
          {error ? <p className="tw-error" role="alert">{error}</p> : null}
          <ActionButton type="submit" title="معاينة السداد التجريبي" icon="receipt-outline" />
        </form>
      </Panel>
      <section className="tw-section">
        <SectionHeader title="مزودو التحصيل في السوق" hint="أمثلة غير مرتبطة" />
        <div className="tw-provider-grid">{collectionProviderExamples.map((provider) => <article key={provider.name} className="tw-provider-card"><strong>{provider.name}</strong><p>{provider.detail}</p><small>غير متصل بـ TAHWELATY</small></article>)}</div>
        <p className="tw-source-note">تظهر هذه الأسماء للتوضيح فقط. توفر الخدمة لأي تطبيق جديد يتطلب اتفاقًا وتكاملًا منفصلين مع المزود والجهة المفوترة.</p>
      </section>
    </Content>
  );
}

export function HistoryScreen({ transactions, onOpenReceipt }: { transactions: DemoTransaction[]; onOpenReceipt: (transaction: DemoTransaction) => void }) {
  return (
    <Content>
      <ScreenHeading eyebrow="سجل هذه الجلسة" title="سجل المحاكاة" subtitle="هذه القائمة مؤقتة داخل جلسة العرض فقط، ولا تمثل كشف حساب بنكيًا." />
      <InlineNotice tone="warning">لا تُحفظ المعاملات بعد إغلاق الصفحة ولا تُرسل إلى بنك أو شبكة دفع.</InlineNotice>
      {transactions.length === 0 ? <Panel className="tw-empty-panel"><span className="tw-empty-icon"><Icon name="document-text-outline" size={22} /></span><strong>السجل فارغ</strong><p>جرّب إدخال بيانات اختبار في شاشة التحويل أو الفواتير لعرض سجل محاكاة.</p></Panel> : <div className="tw-list">{transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onClick={() => onOpenReceipt(transaction)} />)}</div>}
    </Content>
  );
}

export function SecurityScreen({ pinConfigured, onSetupPin, onShowNotice }: { pinConfigured: boolean; onSetupPin: () => void; onShowNotice: (message: string) => void }) {
  return (
    <Content>
      <ScreenHeading eyebrow="أمان على مستوى الجلسة فقط" title="إعدادات الحماية" subtitle="PIN هنا لمعاينة تدفق الويب فقط، ولا يصادق على دفعة حقيقية." />
      <InlineNotice tone="warning">لا توجد خدمة مالية مرتبطة. PIN يظل في ذاكرة الصفحة لهذه الجلسة فقط، ولا يُحفظ بعد إغلاقها. لا تعتمد على هذه الشاشة لحماية أموال.</InlineNotice>
      <Panel>
        <div className="tw-security-row"><span className="tw-security-icon"><Icon name="keypad-outline" color="var(--gold)" size={21} /></span><div><h2>رمز PIN للتجربة</h2><p>{pinConfigured ? "تم إعداد رمز مؤقت لهذه الجلسة" : "لم يتم إعداد رمز لهذه الجلسة"}</p></div><Pill tone={pinConfigured ? "teal" : "muted"}>{pinConfigured ? "مؤقت" : "غير مضبوط"}</Pill></div>
        <ActionButton title={pinConfigured ? "تغيير PIN المؤقت" : "إعداد PIN للتجربة"} icon="create-outline" variant="secondary" onClick={onSetupPin} />
        <p className="tw-helper">اختر 4 أرقام غير حقيقية. لا تستخدم رمزك البنكي أو رمز محفظتك.</p>
      </Panel>
      <Panel>
        <div className="tw-security-row"><span className="tw-security-icon tw-security-icon--teal"><Icon name="finger-print-outline" color="var(--teal)" size={23} /></span><div><h2>بصمة الإصبع أو Face ID</h2><p>غير متاحة في نسخة المتصفح التجريبية</p></div><Pill tone="muted">تطبيق الهاتف فقط</Pill></div>
        <ActionButton title="لماذا لا تعمل البصمة هنا؟" icon="information-circle-outline" variant="secondary" onClick={() => onShowNotice("المتصفح لا يستخدم مستشعر البصمة الخاص بالتطبيق الأصلي. يمكن اختبار بصمة الجهاز في نسخة Android/iPhone، لكنها لا تؤمّن أموالًا في هذا النموذج.")} />
        <p className="tw-helper">التحقق البيومتري المحلي متاح في تطبيق الهاتف الأصلي على جهاز مدعوم. لا يتم استخدام بيانات البصمة داخل نسخة الويب.</p>
      </Panel>
      <Panel className="tw-safety-card"><h2>تذكيرات لحمايتك</h2><SafetyTip text="لا تشارك رمز OTP أو PIN مع أي شخص، حتى لو ادعى أنه من خدمة العملاء." /><SafetyTip text="تحقق من اسم المستفيد والمبلغ قبل تأكيد أي معاملة مستقبلية." /><SafetyTip text="نزّل التطبيق من المتاجر الرسمية فقط، ولا تفتح روابط دفع مجهولة." /><ActionButton title="فهمت" icon="checkmark-outline" variant="quiet" onClick={() => onShowNotice("هذه النصائح توعوية فقط؛ النسخة الحالية لا تتعامل مع أموال أو حسابات حقيقية.")} /></Panel>
    </Content>
  );
}

function SafetyTip({ text }: { text: string }) {
  return <div className="tw-tip-row"><Icon name="checkmark-circle-outline" color="var(--teal)" size={17} /><p>{text}</p></div>;
}

export function SupportScreen({ onLocalSubmit }: { onLocalSubmit: () => void }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim().length < 8) { setError("اكتب وصفًا تجريبيًا من 8 أحرف على الأقل."); setSubmitted(false); return; }
    setError(""); setSubmitted(true); setMessage(""); onLocalSubmit();
  };
  return (
    <Content>
      <ScreenHeading eyebrow="مركز المساعدة" title="الدعم والشكاوى" subtitle="هذا النموذج محلي للمعاينة؛ لا يرسل بلاغًا ولا يتصل بخدمة عملاء حقيقية." />
      <InlineNotice tone="warning">لا تكتب رقم بطاقة أو رقم قومي أو رقم حساب أو كلمة مرور. لا يوجد فريق دعم فعلي متصل بهذا النموذج.</InlineNotice>
      <Panel>
        <h2>أرسل ملاحظة تجريبية</h2>
        <form className="tw-form" onSubmit={submit} noValidate>
          <TextAreaField label="وصف المشكلة" value={message} onValueChange={(value) => { setMessage(value); setSubmitted(false); setError(""); }} placeholder="اكتب ملاحظة غير حساسة لاختبار تجربة الدعم" rows={5} maxLength={500} aria-label="وصف شكوى تجريبية، لا يتم إرسالها" />
          <p className="tw-helper">{message.length}/500 حرفًا</p>
          {error ? <p className="tw-error" role="alert">{error}</p> : null}
          {submitted ? <InlineNotice tone="success">تمت معاينة النموذج محليًا فقط. لم يتم إرسال الشكوى.</InlineNotice> : null}
          <ActionButton type="submit" title="معاينة إرسال محلي" icon="chatbubble-ellipses-outline" />
        </form>
      </Panel>
      <Panel><h2>قنوات الاتصال الحقيقية</h2><p>لا توجد قنوات دعم رسمية مفعّلة لهذا المشروع بعد. ستضاف وسائل اتصال موثّقة بعد إطلاق الجهة المشغّلة.</p></Panel>
    </Content>
  );
}

export function FeesScreen() {
  const rows = [["رسوم التحويل", "تُحدد بعد التعاقد مع مزود الدفع"], ["رسوم سداد الفواتير", "تختلف حسب الخدمة والمزود"], ["حدود العمليات اليومية", "تخضع لمتطلبات المزود والامتثال"], ["وقت تنفيذ أو عكس العملية", "يُعرض بعد التكامل والاختبار"]];
  return (
    <Content>
      <ScreenHeading eyebrow="شفافية قبل الإطلاق" title="الرسوم والحدود" subtitle="لن نخترع رسومًا أو حدودًا مالية. لا تتوفر قيم نهائية قبل اختيار مزود الخدمة والحصول على شروطه المعتمدة." />
      <InlineNotice tone="warning">كل القيم في صفحة العرض إرشادية فقط. لا يوجد حساب فعلي ولا حد تحويل مفعّل.</InlineNotice>
      <Panel className="tw-fees-list">{rows.map(([title, value]) => <div className="tw-fee-row" key={title}><strong>{title}</strong><span>{value}</span></div>)}</Panel>
      <Panel><h2>ما قبل الإطلاق الفعلي</h2><p>تحتاج الشروط إلى مراجعة قانونية وتشغيلية، وإظهار الرسوم والحدود قبل موافقة العميل، مع سياسة واضحة للاسترداد والشكاوى.</p></Panel>
    </Content>
  );
}

export function MoreScreen({ onNavigate, onShowNotice, onInstall }: { onNavigate: (tab: TabId) => void; onShowNotice: (message: string) => void; onInstall: () => void }) {
  const items: { title: string; subtitle: string; icon: "pricetag-outline" | "chatbubble-ellipses-outline" | "shield-checkmark-outline" | "information-circle-outline"; action: () => void }[] = [
    { title: "الرسوم والحدود", subtitle: "سيتم تحديثها بعد الاتفاق مع المزود", icon: "pricetag-outline", action: () => onNavigate("fees") },
    { title: "الدعم والشكاوى", subtitle: "نموذج تجريبي غير متصل", icon: "chatbubble-ellipses-outline", action: () => onNavigate("support") },
    { title: "إعدادات الأمان", subtitle: "PIN مؤقت، والبصمة في تطبيق الهاتف فقط", icon: "shield-checkmark-outline", action: () => onNavigate("security") },
    { title: "إضافة إلى الشاشة الرئيسية", subtitle: "تثبيت واجهة الويب على جهازك", icon: "information-circle-outline", action: onInstall },
  ];
  return (
    <Content>
      <ScreenHeading eyebrow="المزيد" title="معلومات التجربة" subtitle="مزايا إضافية مفيدة قبل إطلاق خدمة مالية حقيقية." />
      <InlineNotice tone="warning">هذه النسخة لا تحوّل أموالًا ولا تسدد فواتير. الأزرار أدناه للتجربة ولا ترسل بيانات.</InlineNotice>
      <Panel className="tw-menu-list">{items.map((item) => <button key={item.title} type="button" className="tw-menu-item" onClick={item.action}><span className="tw-menu-icon"><Icon name={item.icon} color="var(--gold)" size={20} /></span><span className="tw-menu-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span><Icon name="chevron-back" size={17} /></button>)}<button type="button" className="tw-menu-item" onClick={() => onShowNotice("هذا إصدار واجهات تجريبي. لا تمثل العلامة شراكة مع أي مزود مالي.")}><span className="tw-menu-icon"><Icon name="information-circle-outline" color="var(--gold)" size={20} /></span><span className="tw-menu-copy"><strong>عن TAHWELATY</strong><small>نسخة واجهات — لا يوجد مشغل مالي</small></span><Icon name="chevron-back" size={17} /></button></Panel>
      <Panel><h2>مزايا مقترحة للإطلاق</h2><p>بعد الربط المرخص: إيصالات قابلة للتحقق، إشعارات حالة، سجل عكس وتسوية، حدود واضحة، وإجراءات اعتراض واسترداد قابلة للتتبع.</p></Panel>
    </Content>
  );
}

export function PinDialog({ mode, pendingAction, error, pinInput, newPin, confirmPin, onPinInput, onNewPin, onConfirmPin, onSave, onVerify, onClose, onShowNotice }: {
  mode: "setup" | "verify";
  pendingAction: DemoAction | null;
  error: string;
  pinInput: string;
  newPin: string;
  confirmPin: string;
  onPinInput: (value: string) => void;
  onNewPin: (value: string) => void;
  onConfirmPin: (value: string) => void;
  onSave: () => void;
  onVerify: () => void;
  onClose: () => void;
  onShowNotice: (message: string) => void;
}) {
  const isSetup = mode === "setup";
  const title = isSetup ? "إعداد PIN تجريبي" : "تحقق قبل المعاينة";
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (isSetup) onSave(); else onVerify(); };
  return (
    <div className="tw-modal-backdrop" role="presentation">
      <section className="tw-modal" role="dialog" aria-modal="true" aria-labelledby="tw-pin-title">
        <div className="tw-modal-top"><span className="tw-modal-icon"><Icon name={isSetup ? "keypad-outline" : "shield-checkmark-outline"} color="var(--gold)" size={24} /></span><button type="button" className="tw-icon-button" onClick={onClose} aria-label="إغلاق النافذة"><Icon name="close" size={19} /></button></div>
        <Pill tone="red">محاكاة فقط</Pill>
        <h2 id="tw-pin-title">{title}</h2>
        <p className="tw-subtitle">لا يتم إرسال أموال أو حفظ PIN في قاعدة بيانات. يظل الرمز في ذاكرة الصفحة الحالية فقط.</p>
        {pendingAction ? <div className="tw-pending-summary"><span>{pendingAction.kind}</span><strong>{formatMoney(pendingAction.amount)} ج.م</strong><small>{pendingAction.service} · {pendingAction.target}</small></div> : null}
        <form className="tw-form" onSubmit={submit}>
          {isSetup ? <><Field label="PIN تجريبي (4 أرقام)" value={newPin} onValueChange={onNewPin} placeholder="••••" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} dir="ltr" /><Field label="تأكيد PIN" value={confirmPin} onValueChange={onConfirmPin} placeholder="••••" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} dir="ltr" /></> : <Field label="أدخل PIN المؤقت" value={pinInput} onValueChange={onPinInput} placeholder="••••" type="password" inputMode="numeric" autoComplete="current-password" maxLength={4} dir="ltr" />}
          {error ? <p className="tw-error" role="alert">{error}</p> : null}
          <ActionButton type="submit" title={isSetup ? "حفظ PIN في الذاكرة" : "متابعة المحاكاة"} icon="shield-checkmark-outline" />
        </form>
        <button type="button" className="tw-text-button tw-biometric-help" onClick={() => onShowNotice("البصمة لا تعمل في المتصفح. يمكنك تجربتها داخل تطبيق الهاتف الأصلي فقط، ولا تفعّل دفعة حقيقية.")}>استخدام بصمة الجهاز؟ متاح في تطبيق الهاتف فقط</button>
        <p className="tw-helper">استخدم أرقامًا وهمية فقط. لا تستخدم PIN بنكيًا أو رمز محفظة حقيقيًا.</p>
      </section>
    </div>
  );
}

export function ReceiptDialog({ transaction, onClose }: { transaction: DemoTransaction; onClose: () => void }) {
  return (
    <div className="tw-modal-backdrop" role="presentation">
      <section className="tw-modal tw-receipt-modal" role="dialog" aria-modal="true" aria-labelledby="tw-receipt-title">
        <div className="tw-modal-top"><span className="tw-modal-icon"><Icon name="receipt-outline" color="var(--gold)" size={24} /></span><button type="button" className="tw-icon-button" onClick={onClose} aria-label="إغلاق الإيصال"><Icon name="close" size={19} /></button></div>
        <Pill tone="red">إيصال محاكاة — غير صالح للدفع</Pill>
        <h2 id="tw-receipt-title">معاينة العملية</h2>
        <p className="tw-receipt-amount">{formatMoney(transaction.amount)} ج.م</p>
        <dl className="tw-receipt-details"><div><dt>النوع</dt><dd>{transaction.kind}</dd></div><div><dt>الخدمة</dt><dd>{transaction.service}</dd></div><div><dt>المعرف</dt><dd>{transaction.target}</dd></div><div><dt>المرجع</dt><dd>{transaction.id}</dd></div><div><dt>التاريخ</dt><dd>{transaction.date}</dd></div><div><dt>الحالة</dt><dd><Pill tone="muted">تجريبي — لم يتم الدفع</Pill></dd></div></dl>
        <InlineNotice tone="warning">لم تُرسل أموال ولم يتم دفع أي فاتورة. لا تستخدم هذا الإيصال لإثبات عملية حقيقية.</InlineNotice>
        <ActionButton title="إغلاق" onClick={onClose} />
      </section>
    </div>
  );
}

export function InstallHelpDialog({ isIOS, isAndroid, onClose }: { isIOS: boolean; isAndroid: boolean; onClose: () => void }) {
  const instructions = isIOS
    ? "على iPhone: افتح المعاينة في Safari، اضغط زر المشاركة، اختر «إضافة إلى الشاشة الرئيسية»، ثم اضغط «إضافة»."
    : isAndroid
      ? "على Android: افتح المعاينة عبر HTTPS في Chrome، افتح قائمة ⋮، ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."
      : "افتح المعاينة من متصفح هاتف يدعم التثبيت. في Chrome على Android اختر «تثبيت التطبيق»، وفي Safari على iPhone اختر مشاركة ثم «إضافة إلى الشاشة الرئيسية».";
  return (
    <div className="tw-modal-backdrop" role="presentation">
      <section className="tw-modal" role="dialog" aria-modal="true" aria-labelledby="tw-install-title">
        <div className="tw-modal-top"><span className="tw-modal-icon"><Icon name="download-outline" color="var(--gold)" size={24} /></span><button type="button" className="tw-icon-button" onClick={onClose} aria-label="إغلاق تعليمات التثبيت"><Icon name="close" size={19} /></button></div>
        <Pill tone="teal">واجهة ويب قابلة للإضافة</Pill>
        <h2 id="tw-install-title">إضافة TAHWELATY للشاشة الرئيسية</h2>
        <p>{instructions}</p>
        <InlineNotice tone="warning">يلزم فتح معاينة HTTPS في متصفح الهاتف نفسه. قد تختلف تسمية خيار الإضافة حسب إصدار المتصفح.</InlineNotice>
        <ActionButton title="حسنًا" onClick={onClose} />
      </section>
    </div>
  );
}
