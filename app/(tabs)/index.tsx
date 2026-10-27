import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  maskSensitiveTarget,
  type DemoAction,
  type DemoTransaction,
  type TabId,
} from "@/components/tahwelaty/data";
import {
  BillsScreen,
  FeesScreen,
  HistoryScreen,
  HomeScreen as DashboardScreen,
  MoreScreen,
  SecurityScreen,
  SupportScreen,
  TransferScreen,
} from "@/components/tahwelaty/screens";
import {
  ActionButton,
  Field,
  Icon,
  InlineNotice,
  palette,
  Panel,
  Pill,
} from "@/components/tahwelaty/ui";

const tabItems: { id: Exclude<TabId, "support" | "fees">; title: string; icon: "home-outline" | "swap-horizontal-outline" | "receipt-outline" | "shield-checkmark-outline" | "grid-outline" }[] = [
  { id: "home", title: "الرئيسية", icon: "home-outline" },
  { id: "pay", title: "الدفع", icon: "swap-horizontal-outline" },
  { id: "history", title: "السجل", icon: "receipt-outline" },
  { id: "security", title: "الأمان", icon: "shield-checkmark-outline" },
  { id: "more", title: "المزيد", icon: "grid-outline" },
];

type PinModal = "setup" | "verify" | null;

function normalizePin(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function createDemoId() {
  return `DEMO-${Date.now().toString(36).toUpperCase()}`;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [payMode, setPayMode] = useState<"transfer" | "bills">("transfer");
  const [splashVisible, setSplashVisible] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [pin, setPin] = useState("");
  const [pinModal, setPinModal] = useState<PinModal>(null);
  const [pinInput, setPinInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingAction, setPendingAction] = useState<DemoAction | null>(null);
  const [receipt, setReceipt] = useState<DemoTransaction | null>(null);
  const [notice, setNotice] = useState("");
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricAvailability, setBiometricAvailability] = useState(
    Platform.OS === "web" ? "البصمة المحلية غير مفعّلة في واجهة الويب هذه" : "يتم فحص دعم الجهاز…",
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));
  const wideLayout = width >= 740;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (alive) setReduceMotion(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    if (Platform.OS !== "web") {
      Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()])
        .then(([hardware, enrolled]) => {
          if (!alive) return;
          setBiometricAvailability(hardware && enrolled ? "الجهاز يدعم قياسًا حيويًا مسجلًا" : "الجهاز أو إعداداته لا توفر بصمة مسجلة");
        })
        .catch(() => { if (alive) setBiometricAvailability("تعذر التحقق من دعم الجهاز"); });
    }
    return () => { alive = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0);
      progress.setValue(1);
      const timer = setTimeout(() => setSplashVisible(false), 550);
      return () => clearTimeout(timer);
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1150, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1150, useNativeDriver: true }),
      ]),
    );
    const fill = Animated.timing(progress, { toValue: 1, duration: 2100, useNativeDriver: false });
    pulseLoop.start();
    fill.start();
    const timer = setTimeout(() => setSplashVisible(false), 2450);
    return () => { pulseLoop.stop(); fill.stop(); clearTimeout(timer); };
  }, [progress, pulse, reduceMotion]);

  const showNotice = (message: string) => setNotice(message);

  const navigate = (tab: TabId) => {
    if (tab === "pay") setPayMode("transfer");
    setActiveTab(tab);
  };

  const requestDemoAction = (action: DemoAction) => {
    setPendingAction({ ...action, target: maskSensitiveTarget(action.target) });
    setPinError("");
    setPinInput("");
    setPinModal(pin ? "verify" : "setup");
  };

  const completeDemoAction = () => {
    if (!pendingAction) return;
    const next: DemoTransaction = {
      ...pendingAction,
      target: maskSensitiveTarget(pendingAction.target),
      id: createDemoId(),
      date: new Date().toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" }),
      status: "demo",
    };
    setTransactions((current) => [next, ...current]);
    setPendingAction(null);
    setPinModal(null);
    setPinInput("");
    setPinError("");
    setReceipt(next);
  };

  const saveDemoPin = () => {
    const first = normalizePin(newPin);
    const second = normalizePin(confirmPin);
    if (!/^\d{4}$/.test(first)) {
      setPinError("يجب أن يتكون PIN التجريبي من 4 أرقام.");
      return;
    }
    if (first !== second) {
      setPinError("الرمزان غير متطابقين. أعد إدخالهما.");
      return;
    }
    setPin(first);
    setNewPin("");
    setConfirmPin("");
    setPinError("");
    showNotice("تم إعداد PIN مؤقت في ذاكرة هذه الجلسة. لا يحمي أموالًا ولا يُحفظ بعد إغلاق التطبيق.");
    setPinModal(pendingAction ? "verify" : null);
  };

  const verifyDemoPin = () => {
    if (normalizePin(pinInput) !== pin) {
      setPinError("الرمز غير صحيح. لم تُنشأ أي معاملة.");
      return;
    }
    completeDemoAction();
  };

  const tryBiometric = async () => {
    if (Platform.OS === "web") {
      showNotice("التحقق البيومتري غير متاح في واجهة الويب التجريبية. استخدم PIN المؤقت بدلًا منه.");
      return;
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "تحقق محلي لمعاينة العملية فقط",
        promptSubtitle: "لن تُرسل أموال أو بيانات",
        cancelLabel: "إلغاء",
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong",
      });
      if (result.success) {
        if (pendingAction) completeDemoAction();
        else {
          setBiometricsEnabled(true);
          showNotice("نجح تحقق الجهاز المحلي. هذا لا يفعّل أو يؤمّن تحويلات حقيقية.");
        }
      } else {
        setPinError("لم يكتمل التحقق من الجهاز. يمكنك المحاولة مرة أخرى أو إدخال PIN التجريبي.");
      }
    } catch {
      setPinError("تعذر بدء تحقق الجهاز. تأكد من تسجيل بصمة أو Face ID على جهازك.");
    }
  };

  const enableBiometrics = async () => {
    if (Platform.OS === "web") {
      showNotice("البصمة لا تعمل في نسخة الويب التجريبية. جرّبها في تطبيق الهاتف على جهاز يدعمها.");
      return;
    }
    try {
      const [hardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hardware || !enrolled) {
        showNotice("لا تتوفر بصمة مسجلة على هذا الجهاز. أضفها من إعدادات الجهاز أولًا.");
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "تجربة تفعيل التحقق المحلي",
        promptSubtitle: "للمعاينة فقط — لا توجد معاملات حقيقية",
        cancelLabel: "إلغاء",
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong",
      });
      if (result.success) {
        setBiometricsEnabled(true);
        showNotice("تم تفعيل اختبار البصمة لهذه الجلسة. لا تُحفظ الإعدادات بعد إغلاق التطبيق.");
      } else {
        showNotice("لم يكتمل تحقق الجهاز، ولم تتغير الإعدادات.");
      }
    } catch {
      showNotice("تعذر بدء التحقق البيومتري على هذا الجهاز.");
    }
  };

  const selectedNav = activeTab === "support" || activeTab === "fees" ? "more" : activeTab;
  const title = activeTab === "home" ? "الرئيسية" : activeTab === "pay" ? "التحويل والخدمات" : activeTab === "history" ? "السجل" : activeTab === "security" ? "الأمان" : activeTab === "support" ? "الدعم" : activeTab === "fees" ? "الرسوم والحدود" : "المزيد";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.background} />
      <View style={[styles.appFrame, wideLayout ? styles.appFrameWide : null]}>
        <View style={styles.appHeader}>
          <View style={styles.brandGroup}>
            <Image source={require("../../assets/images/icon.png")} style={styles.brandIcon} accessible accessibilityLabel="شعار تحويلاتي" />
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitle}>TAHWELATY</Text>
              <Text style={styles.brandSubtitle}>{title}</Text>
            </View>
          </View>
          <Pill tone="red">نسخة تجريبية</Pill>
        </View>

        {notice ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`تنبيه: ${notice}. اضغط للإغلاق`} onPress={() => setNotice("")} style={styles.noticeWrap}>
            <InlineNotice tone="info">{notice}</InlineNotice>
          </Pressable>
        ) : null}

        <View style={styles.screenArea}>
          {activeTab === "home" ? (
            <DashboardScreen onNavigate={navigate} balanceVisible={balanceVisible} onToggleBalance={() => setBalanceVisible((value) => !value)} transactions={transactions} onOpenReceipt={setReceipt} />
          ) : null}
          {activeTab === "pay" ? (
            <View style={styles.payRoot}>
              <View style={styles.modeSwitch} accessibilityRole="tablist">
                <Pressable accessibilityRole="tab" accessibilityState={{ selected: payMode === "transfer" }} onPress={() => setPayMode("transfer")} style={[styles.modeButton, payMode === "transfer" ? styles.modeButtonActive : null]}>
                  <Text style={[styles.modeText, payMode === "transfer" ? styles.modeTextActive : null]}>تحويل تجريبي</Text>
                </Pressable>
                <Pressable accessibilityRole="tab" accessibilityState={{ selected: payMode === "bills" }} onPress={() => setPayMode("bills")} style={[styles.modeButton, payMode === "bills" ? styles.modeButtonActive : null]}>
                  <Text style={[styles.modeText, payMode === "bills" ? styles.modeTextActive : null]}>الفواتير</Text>
                </Pressable>
              </View>
              {payMode === "transfer" ? <TransferScreen onContinue={requestDemoAction} /> : <BillsScreen onContinue={requestDemoAction} />}
            </View>
          ) : null}
          {activeTab === "history" ? <HistoryScreen transactions={transactions} onOpenReceipt={setReceipt} /> : null}
          {activeTab === "security" ? (
            <SecurityScreen
              pinConfigured={pin.length === 4}
              biometricsEnabled={biometricsEnabled}
              biometricAvailability={biometricAvailability}
              onSetupPin={() => { setNewPin(""); setConfirmPin(""); setPinError(""); setPinModal("setup"); }}
              onEnableBiometrics={enableBiometrics}
              onShowNotice={showNotice}
            />
          ) : null}
          {activeTab === "support" ? <SupportScreen onLocalSubmit={() => showNotice("تمت معاينة النموذج محليًا فقط؛ لم يتم إرسال الشكوى لأي جهة.")} /> : null}
          {activeTab === "fees" ? <FeesScreen /> : null}
          {activeTab === "more" ? <MoreScreen onNavigate={navigate} onShowNotice={showNotice} /> : null}
        </View>

        <View accessibilityRole="tablist" style={styles.bottomNav}>
          {tabItems.map((item) => {
            const selected = selectedNav === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                accessibilityLabel={item.title}
                accessibilityState={{ selected }}
                onPress={() => navigate(item.id)}
                style={({ pressed }) => [styles.navItem, selected ? styles.navItemSelected : null, pressed ? styles.navPressed : null]}
              >
                <Ionicons name={item.icon} size={20} color={selected ? palette.gold : palette.subtle} accessible={false} />
                <Text style={[styles.navText, selected ? styles.navTextSelected : null]}>{item.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal transparent visible={pinModal !== null} animationType="fade" onRequestClose={() => { setPinModal(null); setPendingAction(null); }} statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Panel style={styles.modalPanel}>
              <View style={styles.modalTop}>
                <View style={styles.modalIcon}><Icon name={pinModal === "setup" ? "keypad-outline" : "shield-checkmark-outline"} color={palette.gold} size={24} /></View>
                <Pressable accessibilityRole="button" accessibilityLabel="إغلاق النافذة" onPress={() => { setPinModal(null); setPendingAction(null); }} style={styles.closeButton}><Icon name="close" size={19} color={palette.muted} /></Pressable>
              </View>
              <Pill tone="red">مصادقة محلية للتجربة</Pill>
              {pinModal === "setup" ? (
                <>
                  <Text accessibilityRole="header" style={styles.modalTitle}>أنشئ PIN مؤقتًا</Text>
                  <Text style={styles.modalCopy}>أدخل رمزًا تجريبيًا من 4 أرقام، ثم أعد إدخاله. سيبقى في ذاكرة التطبيق حتى إغلاقه فقط.</Text>
                  <Field label="PIN جديد" value={newPin} onChangeText={setNewPin} placeholder="••••" keyboardType="number-pad" secureTextEntry maxLength={4} accessibilityLabel="إنشاء رمز PIN تجريبي من أربعة أرقام" />
                  <Field label="تأكيد PIN" value={confirmPin} onChangeText={setConfirmPin} placeholder="••••" keyboardType="number-pad" secureTextEntry maxLength={4} accessibilityLabel="تأكيد رمز PIN التجريبي" />
                  {pinError ? <Text accessibilityRole="alert" style={styles.modalError}>{pinError}</Text> : null}
                  <ActionButton title="حفظ مؤقتًا في هذه الجلسة" icon="lock-closed-outline" onPress={saveDemoPin} />
                </>
              ) : (
                <>
                  <Text accessibilityRole="header" style={styles.modalTitle}>تحقق قبل عرض المحاكاة</Text>
                  <Text style={styles.modalCopy}>هذه خطوة توضيحية فقط. لم يُرسل طلب دفع ولم يتغير رصيدك.</Text>
                  {pendingAction ? (
                    <View style={styles.pendingSummary}>
                      <Text style={styles.pendingText}>{pendingAction.kind} · {pendingAction.service}</Text>
                      <Text style={styles.pendingAmount}>{pendingAction.amount.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م</Text>
                    </View>
                  ) : null}
                  <Field label="أدخل PIN التجريبي" value={pinInput} onChangeText={setPinInput} placeholder="••••" keyboardType="number-pad" secureTextEntry maxLength={4} accessibilityLabel="إدخال رمز PIN للتحقق من المحاكاة" />
                  {pinError ? <Text accessibilityRole="alert" style={styles.modalError}>{pinError}</Text> : null}
                  <ActionButton title="تحقق باستخدام PIN" icon="keypad-outline" onPress={verifyDemoPin} />
                  {Platform.OS !== "web" ? <ActionButton title={biometricsEnabled ? "استخدام بصمة الجهاز" : "تجربة بصمة الجهاز"} icon="finger-print-outline" variant="secondary" onPress={tryBiometric} /> : null}
                  <Text style={styles.modalFootnote}>التحقق البيومتري، إن نجح، يثبت هويتك للجهاز فقط في هذه المعاينة ولا يصادق على دفعة.</Text>
                </>
              )}
            </Panel>
          </ScrollView>
        </View>
      </Modal>

      <Modal transparent visible={receipt !== null} animationType="fade" onRequestClose={() => setReceipt(null)} statusBarTranslucent>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Panel style={styles.modalPanel}>
              <View style={styles.receiptCheck}><Icon name="checkmark" color={palette.background} size={24} /></View>
              <Pill tone="red">إيصال محاكاة — ليس إثبات دفع</Pill>
              <Text accessibilityRole="header" style={styles.modalTitle}>لم يتم تنفيذ أي معاملة</Text>
              <Text style={styles.modalCopy}>تم اختبار الواجهة محليًا فقط. لم تُرسل أموال أو بيانات ولم يتغير الرصيد.</Text>
              {receipt ? (
                <View style={styles.receiptRows}>
                  <ReceiptRow label="نوع العملية" value={receipt.kind} />
                  <ReceiptRow label="الخدمة" value={receipt.service} />
                  <ReceiptRow label="المستلم / الحساب" value={receipt.target} />
                  <ReceiptRow label="المبلغ الافتراضي" value={`${receipt.amount.toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م`} />
                  <ReceiptRow label="مرجع محلي" value={receipt.id} />
                  <ReceiptRow label="الحالة" value="محاكاة فقط — لا يوجد دفع" />
                </View>
              ) : null}
              <ActionButton title="إغلاق الإيصال التجريبي" icon="close-outline" onPress={() => setReceipt(null)} />
            </Panel>
          </ScrollView>
        </View>
      </Modal>

      {splashVisible ? (
        <AnimatedSplash
          reduceMotion={reduceMotion}
          pulse={pulse}
          progress={progress}
          onContinue={() => setSplashVisible(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

function AnimatedSplash({
  reduceMotion,
  pulse,
  progress,
  onContinue,
}: {
  reduceMotion: boolean;
  pulse: Animated.Value;
  progress: Animated.Value;
  onContinue: () => void;
}) {
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.58] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1.18] });
  const logoScale = reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.025] });
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["2%", "100%"] });
  return (
    <View accessibilityViewIsModal style={styles.splash}>
      <View style={styles.splashGlowTop} />
      <View style={styles.splashGlowBottom} />
      {!reduceMotion ? <Animated.View style={[styles.splashOrbit, { opacity: pulseOpacity, transform: [{ scale: pulseScale }, { rotate: "-12deg" }] }]} /> : null}
      <View style={styles.splashContent}>
        <View style={styles.splashLogoFrame}>
          <Animated.Image source={require("../../assets/images/icon.png")} style={[styles.splashLogo, { transform: [{ scale: logoScale }] }]} accessible accessibilityLabel="الشعار المتوهج لتحويلاتي" />
        </View>
        <Text style={styles.splashWordmark}>TAHWELATY</Text>
        <Text style={styles.splashArabic}>تحويلاتي</Text>
        <Text style={styles.splashSubtitle}>خطواتك المالية أوضح</Text>
        <View style={styles.progressTrack} accessibilityLabel="جاري تحميل تجربة العرض">
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.splashDemoLabel}>تجربة واجهات — المدفوعات غير مفعّلة</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="تخطي الشاشة الافتتاحية" onPress={onContinue} style={styles.skipButton}>
        <Text style={styles.skipText}>تخطي</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  appFrame: { flex: 1, width: "100%", alignSelf: "center", backgroundColor: palette.background },
  appFrameWide: { maxWidth: 1080, borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#152838" },
  appHeader: { minHeight: 66, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: palette.border, backgroundColor: palette.background },
  brandGroup: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  brandIcon: { height: 40, width: 40, borderRadius: 12, borderWidth: 1, borderColor: "#3C524D", backgroundColor: palette.surface },
  brandTextGroup: { alignItems: "flex-end", gap: 2 },
  brandTitle: { color: palette.gold, fontSize: 14, fontWeight: "900", letterSpacing: 1.2 },
  brandSubtitle: { color: palette.muted, fontSize: 10, fontWeight: "600", textAlign: "right" },
  noticeWrap: { paddingHorizontal: 12, paddingTop: 8 },
  screenArea: { flex: 1, width: "100%" },
  payRoot: { flex: 1 },
  modeSwitch: { flexDirection: "row-reverse", marginHorizontal: 18, marginTop: 12, marginBottom: 2, padding: 4, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 15 },
  modeButton: { minHeight: 40, flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  modeButtonActive: { backgroundColor: "#2D2A20", borderWidth: 1, borderColor: "#615436" },
  modeText: { color: palette.muted, fontSize: 12, fontWeight: "700" },
  modeTextActive: { color: palette.gold, fontWeight: "900" },
  bottomNav: { flexDirection: "row-reverse", minHeight: 66, paddingHorizontal: 6, paddingTop: 7, paddingBottom: Platform.OS === "web" ? 6 : 9, backgroundColor: "#081521", borderTopWidth: 1, borderTopColor: palette.border },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, borderRadius: 13 },
  navItemSelected: { backgroundColor: "#1B241F" },
  navPressed: { opacity: 0.75 },
  navText: { color: palette.subtle, fontSize: 9, fontWeight: "700" },
  navTextSelected: { color: palette.gold, fontWeight: "900" },
  modalBackdrop: { flex: 1, backgroundColor: "#000000CC", justifyContent: "center", padding: 16 },
  modalScroll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  modalPanel: { width: "100%", maxWidth: 480, padding: 20, borderColor: "#485044", gap: 14 },
  modalTop: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  modalIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#332F21" },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: palette.surface },
  modalTitle: { color: palette.text, fontSize: 20, fontWeight: "900", textAlign: "right" },
  modalCopy: { color: palette.muted, fontSize: 12, lineHeight: 20, textAlign: "right" },
  modalError: { color: palette.red, fontSize: 12, lineHeight: 18, textAlign: "right" },
  modalFootnote: { color: palette.subtle, fontSize: 10, lineHeight: 16, textAlign: "right" },
  pendingSummary: { padding: 12, backgroundColor: palette.surface, borderRadius: 14, borderWidth: 1, borderColor: palette.border, gap: 5 },
  pendingText: { color: palette.muted, fontSize: 11, textAlign: "right" },
  pendingAmount: { color: palette.gold, fontSize: 18, fontWeight: "900", textAlign: "right" },
  receiptCheck: { height: 48, width: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: palette.teal, alignSelf: "center" },
  receiptRows: { gap: 0, padding: 12, backgroundColor: palette.surface, borderRadius: 15, borderWidth: 1, borderColor: palette.border },
  receiptRow: { minHeight: 40, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottomWidth: 1, borderBottomColor: "#1A2D3B", paddingVertical: 7 },
  receiptLabel: { color: palette.muted, fontSize: 10, flex: 1, textAlign: "right" },
  receiptValue: { color: palette.text, fontSize: 11, fontWeight: "800", flex: 1.5, textAlign: "left" },
  splash: { ...StyleSheet.absoluteFill, zIndex: 100, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#030913" },
  splashGlowTop: { position: "absolute", width: 320, height: 320, borderRadius: 160, top: "12%", backgroundColor: "#2D93701C" },
  splashGlowBottom: { position: "absolute", width: 260, height: 260, borderRadius: 130, bottom: "8%", right: "-20%", backgroundColor: "#B48D3B14" },
  splashOrbit: { position: "absolute", width: 270, height: 270, borderRadius: 135, borderWidth: 1, borderColor: "#DCC47770" },
  splashContent: { alignItems: "center", justifyContent: "center", width: "88%", maxWidth: 430, gap: 7 },
  splashLogoFrame: { width: 174, height: 174, borderRadius: 38, overflow: "hidden", borderWidth: 1, borderColor: "#DCC47755", backgroundColor: palette.surface, marginBottom: 10, shadowColor: palette.teal, shadowOpacity: 0.22, shadowRadius: 30, elevation: 8 },
  splashLogo: { width: "100%", height: "100%" },
  splashWordmark: { color: palette.gold, fontSize: 26, fontWeight: "900", letterSpacing: 4 },
  splashArabic: { color: "#E1E7E8", fontSize: 17, fontWeight: "800" },
  splashSubtitle: { color: palette.teal, fontSize: 12, marginTop: 4 },
  progressTrack: { width: "82%", height: 8, borderRadius: 6, borderColor: "#4A544B", borderWidth: 1, backgroundColor: "#0D1720", overflow: "hidden", marginTop: 25 },
  progressFill: { height: "100%", backgroundColor: palette.gold, borderRadius: 6, shadowColor: palette.gold, shadowOpacity: 0.8, shadowRadius: 8 },
  splashDemoLabel: { color: "#A7B5B7", fontSize: 10, marginTop: 4, textAlign: "center" },
  skipButton: { position: "absolute", top: 22, left: 20, minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#172433", borderWidth: 1, borderColor: "#304050" },
  skipText: { color: palette.text, fontSize: 12, fontWeight: "800" },
});
