import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

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
} from "./data";
import { ActionButton, Field, Icon, InlineNotice, palette, Panel, Pill, ScreenHeading } from "./ui";

const formatMoney = (amount: number) => amount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Content({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return (
    <ScrollView
      contentContainerStyle={[styles.content, { maxWidth: width >= 900 ? 980 : 700 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  );
}

function QuickAction({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: "swap-horizontal-outline" | "receipt-outline" | "headset-outline" | "shield-checkmark-outline";
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed ? styles.pressed : null]}
    >
      <View style={[styles.quickIcon, { borderColor: `${color}55`, backgroundColor: `${color}13` }]}>
        <Icon name={icon} color={color} size={22} />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-back" size={16} color={palette.subtle} />
    </Pressable>
  );
}

export function HomeScreen({
  onNavigate,
  balanceVisible,
  onToggleBalance,
  transactions,
  onOpenReceipt,
}: {
  onNavigate: (tab: TabId) => void;
  balanceVisible: boolean;
  onToggleBalance: () => void;
  transactions: DemoTransaction[];
  onOpenReceipt: (transaction: DemoTransaction) => void;
}) {
  const { width } = useWindowDimensions();
  const twoColumns = width >= 650;
  return (
    <Content>
      <View style={[styles.welcomeRow, twoColumns ? styles.rowBetween : null]}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.eyebrow}>محفظتك الرقمية — وضع تجريبي</Text>
          <Text accessibilityRole="header" style={styles.welcomeTitle}>فلوسك في لمحة</Text>
          <Text style={styles.mutedText}>استكشف تجربة تحويل ودفع، بدون معاملات مالية حقيقية.</Text>
        </View>
        <Pill tone="red">لا توجد مدفوعات حقيقية</Pill>
      </View>

      <Panel style={styles.balanceCard}>
        <View style={styles.balanceDecorOne} />
        <View style={styles.balanceDecorTwo} />
        <View style={styles.rowBetween}>
          <Text style={styles.balanceLabel}>الرصيد التجريبي</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={balanceVisible ? "إخفاء الرصيد التجريبي" : "إظهار الرصيد التجريبي"} onPress={onToggleBalance} style={styles.eyeButton}>
            <Icon name={balanceVisible ? "eye-outline" : "eye-off-outline"} color={palette.gold} size={20} />
          </Pressable>
        </View>
        <Text style={styles.balanceAmount}>{balanceVisible ? `${formatMoney(DEMO_BALANCE)} ج.م` : "•••••• ج.م"}</Text>
        <View style={styles.balanceDivider} />
        <View style={styles.rowBetween}>
          <Text style={styles.balanceFoot}>قيمة افتراضية للعرض فقط</Text>
          <Text style={styles.demoRef}>DEMO</Text>
        </View>
      </Panel>

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>ابدأ من هنا</Text>
        <Text style={styles.sectionHint}>كل الخيارات تجريبية</Text>
      </View>
      <View style={[styles.quickGrid, twoColumns ? styles.quickGridWide : null]}>
        <QuickAction title="تحويل تجريبي" subtitle="عاين خطوات التحويل" icon="swap-horizontal-outline" color={palette.teal} onPress={() => onNavigate("pay")} />
        <QuickAction title="دفع الفواتير" subtitle="غاز، كهرباء، مياه واتصالات" icon="receipt-outline" color={palette.gold} onPress={() => onNavigate("pay")} />
        <QuickAction title="الحماية" subtitle="PIN وبصمة الجهاز" icon="shield-checkmark-outline" color={palette.blue} onPress={() => onNavigate("security")} />
        <QuickAction title="الدعم والشكاوى" subtitle="نموذج محلي غير مُرسل" icon="headset-outline" color="#D797CB" onPress={() => onNavigate("support")} />
      </View>

      <InlineNotice tone="warning">لا تدخل بيانات بطاقتك أو كلمة مرور محفظتك. هذه النسخة لا تتصل بأي بنك أو شركة تحصيل.</InlineNotice>

      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>آخر ما عاينته</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="عرض سجل المعاملات التجريبي" onPress={() => onNavigate("history")}>
          <Text style={styles.linkText}>السجل</Text>
        </Pressable>
      </View>
      {transactions.length === 0 ? (
        <Panel style={styles.emptyPanel}>
          <View style={styles.emptyIcon}><Icon name="time-outline" color={palette.gold} size={22} /></View>
          <Text style={styles.emptyTitle}>لا توجد محاكاة بعد</Text>
          <Text style={styles.mutedText}>عند تجربة التدفق، سيظهر سجل محلي مؤقت مع تنبيه واضح بأنه غير حقيقي.</Text>
        </Panel>
      ) : (
        <View style={styles.listGap}>
          {transactions.slice(0, 3).map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} onPress={() => onOpenReceipt(transaction)} />
          ))}
        </View>
      )}
    </Content>
  );
}

function TransactionRow({ transaction, onPress }: { transaction: DemoTransaction; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`عرض تفاصيل ${transaction.kind} تجريبي`} onPress={onPress} style={({ pressed }) => [styles.transactionRow, pressed ? styles.pressed : null]}>
      <View style={styles.transactionIcon}><Icon name={transaction.kind.includes("فاتورة") ? "receipt-outline" : "swap-horizontal-outline"} color={palette.teal} size={19} /></View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle} numberOfLines={1}>{transaction.service}</Text>
        <Text style={styles.transactionMeta} numberOfLines={1}>{transaction.target} · {transaction.date}</Text>
      </View>
      <View style={styles.transactionAmountWrap}>
        <Text style={styles.transactionAmount}>{formatMoney(transaction.amount)} ج.م</Text>
        <Text style={styles.transactionDemo}>محاكاة</Text>
      </View>
    </Pressable>
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
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export function TransferScreen({ onContinue }: { onContinue: (action: DemoAction) => void }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const number = parseDemoAmount(amount);
  const cleanPhone = normalizeDigits(phone.trim()).replace(/[\s-]/g, "");

  const submit = () => {
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      setError("أدخل رقم هاتف مصريًا مكوّنًا من 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.");
      return;
    }
    if (number === null) {
      setError("أدخل مبلغًا موجبًا، وبحد أقصى منزلتين عشريتين.");
      return;
    }
    setError("");
    onContinue({ kind: "تحويل تجريبي", service: "تحويل محلي (غير مربوط)", target: maskSensitiveTarget(cleanPhone), amount: number });
    setPhone("");
    setAmount("");
  };

  return (
    <Content>
      <ScreenHeading eyebrow="تحويل الأموال" title="عاين خطوات التحويل" subtitle="لن يتم إرسال أموال أو بيانات إلى أي جهة. أدخل بيانات اختبار غير حساسة فقط." />
      <InlineNotice tone="warning">لا تستخدم رقمًا أو بيانات تخص شخصًا آخر. المتابعة تنشئ سجل محاكاة محليًا فقط، ولا تخصم من الرصيد.</InlineNotice>
      <Panel>
        <View style={styles.formTopRow}>
          <Text style={styles.cardTitle}>معلومات المستلم</Text>
          <Pill tone="muted">تجريبي فقط</Pill>
        </View>
        <Field label="رقم الهاتف / المحفظة" value={phone} onChangeText={(value) => { setPhone(value); setError(""); }} placeholder="01xxxxxxxxx" keyboardType="phone-pad" maxLength={16} accessibilityLabel="رقم هاتف اختبار للمستلم" />
        <Field label="المبلغ الافتراضي (جنيه مصري)" value={amount} onChangeText={(value) => { setAmount(value); setError(""); }} placeholder="0.00" keyboardType="decimal-pad" accessibilityLabel="مبلغ افتراضي للمحاكاة" />
        <View style={styles.providerDisabled}>
          <View style={styles.providerDisabledIcon}><Icon name="link-outline" color={palette.gold} size={18} /></View>
          <View style={styles.providerCopy}>
            <Text style={styles.providerTitle}>مزود التحويل</Text>
            <Text style={styles.mutedText}>غير محدد — بانتظار شريك مرخّص وواجهة API</Text>
          </View>
          <Pill tone="red">غير مفعّل</Pill>
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
        <ActionButton title="متابعة إلى التحقق التجريبي" icon="shield-checkmark-outline" onPress={submit} accessibilityLabel="متابعة لعرض محاكاة التحويل دون إرسال أموال" />
        <Text style={styles.helperText}>المبلغ والرصيد المعروضين تجريبيان، ولا يحدث خصم أو تسوية.</Text>
      </Panel>
      <Panel style={styles.notePanel}>
        <Text style={styles.cardTitle}>ما الذي سيحدث؟</Text>
        <Text style={styles.mutedText}>ستجرب شاشة التحقق المحلية برمز PIN أو بصمة الجهاز إن كانت متاحة. بعد ذلك قد يظهر إيصال محاكاة معلّم بوضوح بأنه غير صالح كإثبات دفع.</Text>
      </Panel>
    </Content>
  );
}

export function BillsScreen({ onContinue }: { onContinue: (action: DemoAction) => void }) {
  const [category, setCategory] = useState<BillCategory>("gas");
  const [biller, setBiller] = useState(billers.gas[0]);
  const [subscriber, setSubscriber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const list = billers[category];
  const number = parseDemoAmount(amount);
  const selectCategory = (next: BillCategory) => {
    setCategory(next);
    setBiller(billers[next][0]);
    setError("");
  };
  const submit = () => {
    const normalizedSubscriber = normalizeDigits(subscriber.trim());
    if (!/^\d{4,32}$/.test(normalizedSubscriber)) {
      setError("أدخل رقم مشترك تجريبيًا من 4 إلى 32 رقمًا، من دون حروف أو رموز.");
      return;
    }
    if (number === null) {
      setError("أدخل مبلغًا موجبًا، وبحد أقصى منزلتين عشريتين.");
      return;
    }
    setError("");
    onContinue({ kind: "سداد فاتورة تجريبي", service: biller, target: maskSensitiveTarget(`رقم مشترك تجريبي: ${normalizedSubscriber}`), amount: number });
    setSubscriber("");
    setAmount("");
  };
  return (
    <Content>
      <ScreenHeading eyebrow="خدمات منزلية" title="الفواتير والخدمات" subtitle="أسماء الجهات أمثلة واقعية للتصميم فقط. لا يوجد استعلام أو سداد متصل بها." />
      <InlineNotice tone="warning">اختيار شركة هنا لا يعني وجود عقد أو تكامل معها، ولن تُرسل بيانات رقم العداد أو المشترك إلى أي جهة.</InlineNotice>
      <View style={styles.categoryGrid}>
        {billCategories.map((item) => {
          const selected = category === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`اختيار فئة ${item.title}`}
              accessibilityState={{ selected }}
              onPress={() => selectCategory(item.id)}
              style={[styles.categoryCard, selected ? { borderColor: item.accent, backgroundColor: `${item.accent}14` } : null]}
            >
              <Icon name={item.icon as "flame-outline"} size={21} color={item.accent} />
              <Text style={styles.categoryTitle}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>
      <Panel>
        <Text style={styles.cardTitle}>اختر الشركة المزودة للخدمة</Text>
        <View style={styles.billerList}>
          {list.map((name) => {
            const selected = biller === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => { setBiller(name); setError(""); }}
                style={[styles.billerOption, selected ? styles.billerOptionSelected : null]}
              >
                <View style={[styles.radioDot, selected ? styles.radioDotSelected : null]} />
                <Text style={styles.billerText}>{name}</Text>
              </Pressable>
            );
          })}
        </View>
        <Field label="رقم المشترك أو العداد (بيانات اختبار فقط)" value={subscriber} onChangeText={(value) => { setSubscriber(value); setError(""); }} placeholder="أدخل رقمًا وهميًا للتجربة" keyboardType="number-pad" maxLength={32} accessibilityLabel="رقم مشترك تجريبي" />
        <Field label="المبلغ الافتراضي (جنيه مصري)" value={amount} onChangeText={(value) => { setAmount(value); setError(""); }} placeholder="0.00" keyboardType="decimal-pad" accessibilityLabel="مبلغ فاتورة افتراضي للمحاكاة" />
        {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
        <ActionButton title="معاينة السداد التجريبي" icon="receipt-outline" onPress={submit} accessibilityLabel="معاينة محاكاة دفع فاتورة دون الاتصال بالشركة" />
      </Panel>
      <View style={styles.sectionHeader}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>مزودو التحصيل في السوق</Text>
        <Pill tone="red">أمثلة غير مرتبطة</Pill>
      </View>
      <View style={styles.providerExamples}>
        {collectionProviderExamples.map((provider) => (
          <View key={provider.name} style={styles.providerExample}>
            <Text style={styles.providerExampleName}>{provider.name}</Text>
            <Text style={styles.providerExampleDetail}>{provider.detail}</Text>
            <Text style={styles.notConnected}>غير متصل بـ TAHWELATY</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sourceNote}>تظهر هذه الأسماء للتوضيح فقط. توفر الخدمة لأي تطبيق جديد يتطلب اتفاقًا وتكاملًا منفصلين مع المزود والجهة المفوترة.</Text>
    </Content>
  );
}

export function HistoryScreen({ transactions, onOpenReceipt }: { transactions: DemoTransaction[]; onOpenReceipt: (transaction: DemoTransaction) => void }) {
  return (
    <Content>
      <ScreenHeading eyebrow="سجل الجهاز الحالي" title="سجل المحاكاة" subtitle="هذه القائمة مؤقتة داخل جلسة العرض فقط، ولا تمثل كشف حساب بنكيًا." />
      <InlineNotice tone="warning">لا تُحفظ المعاملات بعد إغلاق التطبيق ولا تُرسل إلى بنك أو شبكة دفع.</InlineNotice>
      {transactions.length === 0 ? (
        <Panel style={styles.emptyPanel}>
          <View style={styles.emptyIcon}><Icon name="document-text-outline" color={palette.gold} size={22} /></View>
          <Text style={styles.emptyTitle}>السجل فارغ</Text>
          <Text style={styles.mutedText}>جرّب إدخال بيانات اختبار في شاشة التحويل أو الفواتير لعرض سجل محاكاة.</Text>
        </Panel>
      ) : (
        <View style={styles.listGap}>
          {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} onPress={() => onOpenReceipt(transaction)} />)}
        </View>
      )}
    </Content>
  );
}

export function SecurityScreen({
  pinConfigured,
  biometricsEnabled,
  biometricAvailability,
  onSetupPin,
  onEnableBiometrics,
  onShowNotice,
}: {
  pinConfigured: boolean;
  biometricsEnabled: boolean;
  biometricAvailability: string;
  onSetupPin: () => void;
  onEnableBiometrics: () => void;
  onShowNotice: (message: string) => void;
}) {
  return (
    <Content>
      <ScreenHeading eyebrow="أمان على مستوى الجهاز فقط" title="إعدادات الحماية" subtitle="إعداد PIN والبصمة هنا لا يصادق على دفعة حقيقية؛ فهي غير متاحة في هذا الإصدار التجريبي." />
      <InlineNotice tone="warning">لا توجد خدمة مالية مرتبطة. PIN يظل في ذاكرة التطبيق لهذه الجلسة فقط، ولا يُحفظ بعد إغلاقها. لا تعتمد على هذه الشاشة لحماية أموال.</InlineNotice>
      <Panel>
        <View style={styles.securityRow}>
          <View style={styles.securityIcon}><Icon name="keypad-outline" color={palette.gold} size={21} /></View>
          <View style={styles.securityCopy}>
            <Text style={styles.cardTitle}>رمز PIN للتجربة</Text>
            <Text style={styles.mutedText}>{pinConfigured ? "تم إعداد رمز مؤقت لهذه الجلسة" : "لم يتم إعداد رمز لهذه الجلسة"}</Text>
          </View>
          <Pill tone={pinConfigured ? "teal" : "muted"}>{pinConfigured ? "مؤقت" : "غير مضبوط"}</Pill>
        </View>
        <ActionButton title={pinConfigured ? "تغيير PIN المؤقت" : "إعداد PIN للتجربة"} icon="create-outline" variant="secondary" onPress={onSetupPin} />
        <Text style={styles.helperText}>اختر 4 أرقام غير حقيقية. لا تستخدم رمزك البنكي أو رمز محفظتك.</Text>
      </Panel>
      <Panel>
        <View style={styles.securityRow}>
          <View style={[styles.securityIcon, { backgroundColor: "#132B2B" }]}><Icon name="finger-print-outline" color={palette.teal} size={24} /></View>
          <View style={styles.securityCopy}>
            <Text style={styles.cardTitle}>بصمة الإصبع أو Face ID</Text>
            <Text style={styles.mutedText}>{biometricsEnabled ? "مفعّلة لمعاينة محلية" : biometricAvailability}</Text>
          </View>
          <Pill tone={biometricsEnabled ? "teal" : "muted"}>{biometricsEnabled ? "تجريبية" : "غير مفعّلة"}</Pill>
        </View>
        <ActionButton title={biometricsEnabled ? "تجربة التحقق بالجهاز" : "تجربة تفعيل بصمة الجهاز"} icon="finger-print-outline" variant="secondary" onPress={onEnableBiometrics} />
        <Text style={styles.helperText}>في الموبايل يظهر طلب النظام إذا كان الجهاز يدعم البصمة ومسجّلًا عليه قياس حيوي. الويب يعرض تنبيهًا فقط.</Text>
      </Panel>
      <Panel style={styles.safetyCard}>
        <Text style={styles.cardTitle}>تذكيرات لحمايتك</Text>
        <SafetyTip text="لا تشارك رمز OTP أو PIN مع أي شخص، حتى لو ادعى أنه من خدمة العملاء." />
        <SafetyTip text="تحقق من اسم المستفيد والمبلغ قبل تأكيد أي معاملة مستقبلية." />
        <SafetyTip text="نزّل التطبيق من المتاجر الرسمية فقط، ولا تفتح روابط دفع مجهولة." />
        <ActionButton title="فهمت" icon="checkmark-outline" variant="quiet" onPress={() => onShowNotice("هذه النصائح توعوية فقط؛ النسخة الحالية لا تتعامل مع أموال أو حسابات حقيقية.")} />
      </Panel>
    </Content>
  );
}

function SafetyTip({ text }: { text: string }) {
  return (
    <View style={styles.tipRow}>
      <Icon name="checkmark-circle-outline" color={palette.teal} size={17} />
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

export function SupportScreen({ onLocalSubmit }: { onLocalSubmit: () => void }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const submit = () => {
    if (message.trim().length < 8) {
      setError("اكتب وصفًا تجريبيًا من 8 أحرف على الأقل.");
      setSubmitted(false);
      return;
    }
    setError("");
    setSubmitted(true);
    setMessage("");
    onLocalSubmit();
  };
  return (
    <Content>
      <ScreenHeading eyebrow="مركز المساعدة" title="الدعم والشكاوى" subtitle="هذا النموذج محلي للمعاينة؛ لا يرسل بلاغًا ولا يتصل بخدمة عملاء حقيقية." />
      <InlineNotice tone="warning">لا تكتب رقم بطاقة أو رقم قومي أو رقم حساب أو كلمة مرور. لا يوجد فريق دعم فعلي متصل بهذا النموذج.</InlineNotice>
      <Panel>
        <Text style={styles.cardTitle}>أرسل ملاحظة تجريبية</Text>
        <Text style={styles.fieldLabel}>وصف المشكلة</Text>
        <TextInput
          accessibilityLabel="وصف شكوى تجريبية، لا يتم إرسالها"
          accessibilityHint="اكتب ملاحظة غير حساسة. ستبقى في هذه المعاينة فقط."
          maxLength={500}
          multiline
          numberOfLines={5}
          onChangeText={(value) => { setMessage(value); setSubmitted(false); setError(""); }}
          placeholder="اكتب ملاحظة غير حساسة لاختبار تجربة الدعم"
          placeholderTextColor={palette.subtle}
          style={styles.textArea}
          textAlign="right"
          value={message}
        />
        <Text style={styles.helperText}>{message.length}/500 حرفًا</Text>
        {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
        {submitted ? <InlineNotice tone="success">تمت معاينة النموذج محليًا فقط. لم يتم إرسال الشكوى.</InlineNotice> : null}
        <ActionButton title="معاينة إرسال محلي" icon="chatbubble-ellipses-outline" onPress={submit} />
      </Panel>
      <Panel>
        <Text style={styles.cardTitle}>قنوات الاتصال الحقيقية</Text>
        <Text style={styles.mutedText}>لا توجد قنوات دعم رسمية مفعّلة لهذا المشروع بعد. ستضاف وسائل اتصال موثّقة بعد إطلاق الجهة المشغّلة.</Text>
      </Panel>
    </Content>
  );
}

export function FeesScreen() {
  return (
    <Content>
      <ScreenHeading eyebrow="شفافية قبل الإطلاق" title="الرسوم والحدود" subtitle="لن نخترع رسومًا أو حدودًا مالية. لا تتوفر قيم نهائية قبل اختيار مزود الخدمة والحصول على شروطه المعتمدة." />
      <InlineNotice tone="warning">كل القيم في صفحة العرض إرشادية فقط. لا يوجد حساب فعلي ولا حد تحويل مفعّل.</InlineNotice>
      <Panel>
        <FeeRow title="رسوم التحويل" value="تُحدد بعد التعاقد مع مزود الدفع" />
        <View style={styles.rowDivider} />
        <FeeRow title="رسوم سداد الفواتير" value="تختلف حسب الخدمة والمزود" />
        <View style={styles.rowDivider} />
        <FeeRow title="حدود العمليات اليومية" value="تخضع لمتطلبات المزود والامتثال" />
        <View style={styles.rowDivider} />
        <FeeRow title="وقت تنفيذ أو عكس العملية" value="يُعرض بعد التكامل والاختبار" />
      </Panel>
      <Panel>
        <Text style={styles.cardTitle}>ما قبل الإطلاق الفعلي</Text>
        <Text style={styles.mutedText}>تحتاج الشروط إلى مراجعة قانونية وتشغيلية، وإظهار الرسوم والحدود قبل موافقة العميل، مع سياسة واضحة للاسترداد والشكاوى.</Text>
      </Panel>
    </Content>
  );
}

function FeeRow({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeTitle}>{title}</Text>
      <Text style={styles.feeValue}>{value}</Text>
    </View>
  );
}

export function MoreScreen({ onNavigate, onShowNotice }: { onNavigate: (tab: TabId) => void; onShowNotice: (message: string) => void }) {
  return (
    <Content>
      <ScreenHeading eyebrow="المزيد" title="معلومات التجربة" subtitle="مزايا إضافية مفيدة قبل إطلاق خدمة مالية حقيقية." />
      <InlineNotice tone="warning">هذه النسخة لا تحوّل أموالًا ولا تسدد فواتير. الأزرار أدناه للتجربة ولا ترسل بيانات.</InlineNotice>
      <View style={styles.menuList}>
        <MenuItem title="الرسوم والحدود" subtitle="سيتم تحديثها بعد الاتفاق مع المزود" icon="pricetag-outline" onPress={() => onNavigate("fees")} />
        <MenuItem title="الدعم والشكاوى" subtitle="نموذج تجريبي غير متصل" icon="chatbubble-ellipses-outline" onPress={() => onNavigate("support")} />
        <MenuItem title="إعدادات الأمان" subtitle="PIN مؤقت وبصمة جهاز للمعاينة" icon="shield-checkmark-outline" onPress={() => onNavigate("security")} />
        <MenuItem title="عن TAHWELATY" subtitle="نسخة واجهات — لا يوجد مشغل مالي" icon="information-circle-outline" onPress={() => onShowNotice("هذا إصدار واجهات تجريبي. لا تمثل العلامة شراكة مع أي مزود مالي.")} />
      </View>
      <Panel>
        <Text style={styles.cardTitle}>مزايا مقترحة للإطلاق</Text>
        <Text style={styles.mutedText}>بعد الربط المرخص: إيصالات قابلة للتحقق، إشعارات حالة، سجل عكس وتسوية، حدود واضحة، وإجراءات اعتراض واسترداد قابلة للتتبع.</Text>
      </Panel>
    </Content>
  );
}

function MenuItem({ title, subtitle, icon, onPress }: { title: string; subtitle: string; icon: "pricetag-outline" | "chatbubble-ellipses-outline" | "shield-checkmark-outline" | "information-circle-outline"; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}: ${subtitle}`} onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed ? styles.pressed : null]}>
      <View style={styles.menuIcon}><Icon name={icon} color={palette.gold} size={20} /></View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.mutedText}>{subtitle}</Text>
      </View>
      <Icon name="chevron-back" size={17} color={palette.subtle} />
    </Pressable>
  );
}

export { TransactionRow };

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: palette.background, width: "100%" },
  content: { width: "100%", alignSelf: "center", paddingHorizontal: 18, paddingTop: 15, paddingBottom: 30, gap: 17 },
  welcomeRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  welcomeCopy: { flex: 1, minWidth: 230, alignItems: "flex-end", gap: 5 },
  rowBetween: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 10 },
  eyebrow: { color: palette.gold, fontSize: 11, fontWeight: "800", textAlign: "right" },
  welcomeTitle: { color: palette.text, fontSize: 26, fontWeight: "900", textAlign: "right" },
  mutedText: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: "right" },
  balanceCard: { backgroundColor: "#102637", borderColor: "#38505B", overflow: "hidden", padding: 20, gap: 8 },
  balanceDecorOne: { position: "absolute", right: -50, top: -80, width: 190, height: 190, borderRadius: 100, backgroundColor: "#DCC47712" },
  balanceDecorTwo: { position: "absolute", left: -50, bottom: -100, width: 190, height: 190, borderRadius: 100, backgroundColor: "#57D2AF12" },
  balanceLabel: { color: "#BCCCD5", fontSize: 12, fontWeight: "700", textAlign: "right" },
  eyeButton: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#091824AA", borderWidth: 1, borderColor: "#48606C" },
  balanceAmount: { color: palette.white, fontSize: 30, fontWeight: "900", textAlign: "right", marginTop: 2 },
  balanceDivider: { height: 1, backgroundColor: "#FFFFFF1D", marginVertical: 5 },
  balanceFoot: { color: "#A9BDC8", fontSize: 11, textAlign: "right" },
  demoRef: { color: palette.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: "900" },
  sectionHeader: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 2 },
  sectionTitle: { color: palette.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  sectionHint: { color: palette.subtle, fontSize: 11, textAlign: "right" },
  linkText: { color: palette.gold, fontSize: 12, fontWeight: "800" },
  quickGrid: { gap: 9 },
  quickGridWide: { flexDirection: "row-reverse", flexWrap: "wrap" },
  quickAction: { minHeight: 70, flexDirection: "row-reverse", alignItems: "center", gap: 11, padding: 12, backgroundColor: palette.surface, borderRadius: 17, borderWidth: 1, borderColor: palette.border, flexGrow: 1 },
  quickIcon: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  quickCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  quickTitle: { color: palette.text, fontSize: 13, fontWeight: "800", textAlign: "right" },
  quickSubtitle: { color: palette.muted, fontSize: 10, textAlign: "right" },
  pressed: { opacity: 0.78 },
  emptyPanel: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#302C20", marginBottom: 4 },
  emptyTitle: { color: palette.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  listGap: { gap: 9 },
  transactionRow: { flexDirection: "row-reverse", alignItems: "center", gap: 11, padding: 13, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 17, minHeight: 74 },
  transactionIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#10312D" },
  transactionInfo: { flex: 1, alignItems: "flex-end", gap: 4 },
  transactionTitle: { color: palette.text, fontSize: 12, fontWeight: "800", textAlign: "right", maxWidth: "100%" },
  transactionMeta: { color: palette.muted, fontSize: 10, textAlign: "right" },
  transactionAmountWrap: { alignItems: "flex-start", gap: 3 },
  transactionAmount: { color: palette.gold, fontSize: 11, fontWeight: "800" },
  transactionDemo: { color: palette.teal, fontSize: 9, fontWeight: "800" },
  formTopRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: palette.text, fontSize: 14, fontWeight: "900", textAlign: "right" },
  providerDisabled: { flexDirection: "row-reverse", alignItems: "center", gap: 10, padding: 12, borderRadius: 15, borderWidth: 1, borderColor: "#55482B", backgroundColor: "#2A271F" },
  providerDisabledIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#423A25", alignItems: "center", justifyContent: "center" },
  providerCopy: { flex: 1, alignItems: "flex-end", gap: 2 },
  providerTitle: { color: palette.text, fontSize: 12, fontWeight: "800", textAlign: "right" },
  helperText: { color: palette.subtle, fontSize: 10, lineHeight: 16, textAlign: "right" },
  errorText: { color: palette.red, fontSize: 12, lineHeight: 18, textAlign: "right" },
  notePanel: { borderColor: "#38505B" },
  categoryGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  categoryCard: { minHeight: 76, width: "48%", flexGrow: 1, borderRadius: 16, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, padding: 12, alignItems: "flex-end", justifyContent: "space-between" },
  categoryTitle: { color: palette.text, fontSize: 12, fontWeight: "800", textAlign: "right" },
  billerList: { gap: 7 },
  billerOption: { minHeight: 44, flexDirection: "row-reverse", alignItems: "center", gap: 9, paddingHorizontal: 11, borderWidth: 1, borderColor: palette.border, borderRadius: 12, backgroundColor: palette.surface },
  billerOptionSelected: { borderColor: palette.gold, backgroundColor: "#2D2A20" },
  radioDot: { height: 15, width: 15, borderRadius: 8, borderWidth: 1.5, borderColor: palette.subtle },
  radioDotSelected: { borderColor: palette.gold, backgroundColor: palette.gold, shadowColor: palette.gold, shadowOpacity: 0.35, shadowRadius: 4 },
  billerText: { flex: 1, color: palette.text, fontSize: 12, textAlign: "right" },
  providerExamples: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 },
  providerExample: { flexGrow: 1, width: "47%", padding: 12, borderWidth: 1, borderColor: palette.border, borderRadius: 15, backgroundColor: palette.surface, gap: 4, alignItems: "flex-end" },
  providerExampleName: { color: palette.gold, fontSize: 14, fontWeight: "900", textAlign: "right" },
  providerExampleDetail: { color: palette.muted, fontSize: 10, textAlign: "right" },
  notConnected: { color: palette.red, fontSize: 9, fontWeight: "800", textAlign: "right", marginTop: 2 },
  sourceNote: { color: palette.subtle, fontSize: 10, lineHeight: 17, textAlign: "right" },
  securityRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  securityIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#332F21", alignItems: "center", justifyContent: "center" },
  securityCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  safetyCard: { borderColor: "#38505B" },
  tipRow: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 8 },
  textArea: { minHeight: 130, maxHeight: 240, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, color: palette.text, padding: 13, fontSize: 14, lineHeight: 21, textAlignVertical: "top" },
  fieldLabel: { color: palette.muted, fontSize: 12, fontWeight: "700", textAlign: "right" },
  feeRow: { gap: 5 },
  feeTitle: { color: palette.text, fontSize: 12, fontWeight: "800", textAlign: "right" },
  feeValue: { color: palette.muted, fontSize: 11, lineHeight: 18, textAlign: "right" },
  rowDivider: { height: 1, backgroundColor: palette.border },
  menuList: { gap: 9 },
  menuItem: { minHeight: 70, flexDirection: "row-reverse", alignItems: "center", gap: 10, padding: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 16 },
  menuIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#302C20" },
  menuCopy: { flex: 1, alignItems: "flex-end", gap: 3 },
  menuTitle: { color: palette.text, fontSize: 13, fontWeight: "800", textAlign: "right" },
});
