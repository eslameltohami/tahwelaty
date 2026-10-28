import { useEffect, useState, type ReactNode } from "react";
import {
  maskSensitiveTarget,
  type DemoAction,
  type DemoTransaction,
  type TabId,
} from "@/components/tahwelaty/data";
import {
  FeesScreen,
  HistoryScreen,
  HomeScreen,
  InstallHelpDialog,
  MoreScreen,
  PinDialog,
  ReceiptDialog,
  SecurityScreen,
  SupportScreen,
  TransferScreen,
  BillsScreen,
} from "./Screens";
import { ActionButton, Icon, InlineNotice, Pill } from "./ui";

const navItems: { id: Exclude<TabId, "support" | "fees">; title: string; icon: "home-outline" | "swap-horizontal-outline" | "receipt-outline" | "shield-checkmark-outline" | "grid-outline" }[] = [
  { id: "home", title: "الرئيسية", icon: "home-outline" },
  { id: "pay", title: "الدفع", icon: "swap-horizontal-outline" },
  { id: "history", title: "السجل", icon: "receipt-outline" },
  { id: "security", title: "الأمان", icon: "shield-checkmark-outline" },
  { id: "more", title: "المزيد", icon: "grid-outline" },
];

const titleFor: Record<TabId, string> = {
  home: "الرئيسية",
  pay: "التحويل والخدمات",
  history: "السجل التجريبي",
  security: "الأمان",
  more: "معلومات التجربة",
  support: "الدعم والشكاوى",
  fees: "الرسوم والحدود",
};

type PinMode = "setup" | "verify" | null;
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function normalizePin(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function createDemoId() {
  return `DEMO-${Date.now().toString(36).toUpperCase()}`;
}

function Splash({ onSkip, reducedMotion }: { onSkip: () => void; reducedMotion: boolean }) {
  return (
    <div className={`tw-splash ${reducedMotion ? "tw-splash--reduced" : ""}`} role="dialog" aria-label="شاشة بداية تحويلاتي">
      <div className="tw-splash-glow" aria-hidden="true" />
      <img className="tw-splash-reference" src="/images/tahwelaty-splash-reference.jpg" alt="شاشة TAHWELATY الافتتاحية ذات الشعار الزجاجي الملون" />
      <p className="tw-splash-note">واجهة تجريبية فقط — لا توجد مدفوعات حقيقية</p>
      <button type="button" className="tw-splash-skip" onClick={onSkip}>تخطي</button>
      <span className="tw-splash-progress" aria-hidden="true"><i /></span>
    </div>
  );
}

function NoticeBar({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="tw-notice-area" aria-live="polite">
      <InlineNotice tone="info">{message}</InlineNotice>
      <button type="button" className="tw-icon-button tw-notice-close" onClick={onClose} aria-label="إغلاق التنبيه"><Icon name="close" size={16} /></button>
    </div>
  );
}

function DesktopAside({ onNavigate, onInstall }: { onNavigate: (tab: TabId) => void; onInstall: () => void }) {
  return (
    <aside className="tw-aside" aria-label="معلومات ومساعدة">
      <section className="tw-aside-card"><span className="tw-aside-icon"><Icon name="shield-checkmark-outline" color="var(--teal)" size={21} /></span><strong>تجربة آمنة للعرض</strong><p>لا يوجد ربط ببنك أو شركة تحصيل. كل العمليات المعروضة محاكاة محلية فقط.</p></section>
      <section className="tw-aside-card"><strong>روابط سريعة</strong><button type="button" className="tw-aside-link" onClick={() => onNavigate("fees")}>الرسوم والحدود<Icon name="chevron-back" size={15} /></button><button type="button" className="tw-aside-link" onClick={() => onNavigate("support")}>الدعم والشكاوى<Icon name="chevron-back" size={15} /></button><button type="button" className="tw-aside-link" onClick={onInstall}>إضافة إلى الشاشة الرئيسية<Icon name="chevron-back" size={15} /></button></section>
      <p className="tw-aside-foot">TAHWELATY · واجهات تجريبية</p>
    </aside>
  );
}

export default function TahwelatyWebApp() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [payMode, setPayMode] = useState<"transfer" | "bills">("transfer");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [pin, setPin] = useState("");
  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [pinInput, setPinInput] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingAction, setPendingAction] = useState<DemoAction | null>(null);
  const [receipt, setReceipt] = useState<DemoTransaction | null>(null);
  const [notice, setNotice] = useState("");
  const [splashVisible, setSplashVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [standalone, setStandalone] = useState(() => typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)));
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener?.("change", onMotionChange);
    return () => query.removeEventListener?.("change", onMotionChange);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), reducedMotion ? 250 : 2050);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setStandalone(true);
      setNotice("تمت إضافة واجهة الويب إلى الشاشة الرئيسية على هذا الجهاز.");
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost")) {
      void navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch(() => undefined);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const showNotice = (message: string) => setNotice(message);

  const navigate = (tab: TabId) => {
    if (tab === "pay") setPayMode("transfer");
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const requestDemoAction = (action: DemoAction) => {
    setPendingAction({ ...action, target: maskSensitiveTarget(action.target) });
    setPinError("");
    setPinInput("");
    setPinMode(pin ? "verify" : "setup");
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
    setPinMode(null);
    setPinInput("");
    setPinError("");
    setReceipt(next);
  };

  const saveDemoPin = () => {
    const first = normalizePin(newPin);
    const second = normalizePin(confirmPin);
    if (!/^\d{4}$/.test(first)) { setPinError("يجب أن يتكون PIN التجريبي من 4 أرقام."); return; }
    if (first !== second) { setPinError("الرمزان غير متطابقين. أعد إدخالهما."); return; }
    setPin(first); setNewPin(""); setConfirmPin(""); setPinError("");
    setNotice("تم إعداد PIN مؤقت في ذاكرة الصفحة. لا يحمي أموالًا ولا يُحفظ بعد إغلاق الصفحة.");
    setPinMode(pendingAction ? "verify" : null);
  };

  const verifyDemoPin = () => {
    if (normalizePin(pinInput) !== pin) { setPinError("الرمز غير صحيح. لم تُنشأ أي معاملة."); return; }
    completeDemoAction();
  };

  const closePinDialog = () => { setPinMode(null); setPendingAction(null); setPinInput(""); setPinError(""); };

  const install = async () => {
    if (standalone) { showNotice("التطبيق مفتوح بالفعل في نافذة مستقلة على هذا الجهاز."); return; }
    if (!installPrompt) { setInstallHelpOpen(true); return; }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") showNotice("بدأ تثبيت واجهة الويب على الجهاز.");
      else setInstallHelpOpen(true);
    } catch {
      setInstallHelpOpen(true);
    }
  };

  let screen: ReactNode;
  if (activeTab === "home") screen = <HomeScreen onNavigate={navigate} balanceVisible={balanceVisible} onToggleBalance={() => setBalanceVisible((value) => !value)} transactions={transactions} onOpenReceipt={setReceipt} />;
  else if (activeTab === "pay") screen = <div className="tw-pay-root"><div className="tw-mode-switch" role="tablist" aria-label="اختيار نوع الخدمة"><button type="button" role="tab" aria-selected={payMode === "transfer"} className={payMode === "transfer" ? "is-selected" : ""} onClick={() => setPayMode("transfer")}>تحويل تجريبي</button><button type="button" role="tab" aria-selected={payMode === "bills"} className={payMode === "bills" ? "is-selected" : ""} onClick={() => setPayMode("bills")}>الفواتير</button></div>{payMode === "transfer" ? <TransferScreen onContinue={requestDemoAction} /> : <BillsScreen onContinue={requestDemoAction} />}</div>;
  else if (activeTab === "history") screen = <HistoryScreen transactions={transactions} onOpenReceipt={setReceipt} />;
  else if (activeTab === "security") screen = <SecurityScreen pinConfigured={pin.length === 4} onSetupPin={() => { setNewPin(""); setConfirmPin(""); setPinError(""); setPinMode("setup"); }} onShowNotice={showNotice} />;
  else if (activeTab === "support") screen = <SupportScreen onLocalSubmit={() => showNotice("تمت معاينة النموذج محليًا فقط؛ لم يتم إرسال الشكوى لأي جهة.")} />;
  else if (activeTab === "fees") screen = <FeesScreen />;
  else screen = <MoreScreen onNavigate={navigate} onShowNotice={showNotice} onInstall={install} />;

  const selectedNav = activeTab === "support" || activeTab === "fees" ? "more" : activeTab;

  return (
    <div className={`tw-app ${reducedMotion ? "tw-app--reduced-motion" : ""}`} dir="rtl">
      <a className="tw-skip-link" href="#tw-main">تجاوز إلى المحتوى</a>
      <div className="tw-top-disclaimer"><Icon name="information-circle-outline" size={16} /><span>نسخة تجريبية — لا تحويلات أو مدفوعات حقيقية</span></div>
      <header className="tw-header">
        <div className="tw-brand"><img src="/icons/pwa-192.png" alt="" width="45" height="45" /><span><strong>TAHWELATY</strong><small>{titleFor[activeTab]}</small></span></div>
        <nav className="tw-desktop-nav" aria-label="التنقل الرئيسي">{navItems.map((item) => <button key={item.id} type="button" className={selectedNav === item.id ? "is-active" : ""} onClick={() => navigate(item.id)} aria-current={selectedNav === item.id ? "page" : undefined}><Icon name={item.icon} size={17} /><span>{item.title}</span></button>)}</nav>
        <div className="tw-header-actions"><Pill tone="red">تجريبي</Pill><ActionButton title={standalone ? "مثبت على الجهاز" : "إضافة للشاشة"} icon="download-outline" variant="secondary" onClick={install} className="tw-install-button" aria-label="إضافة TAHWELATY إلى الشاشة الرئيسية" /></div>
      </header>

      {notice ? <NoticeBar message={notice} onClose={() => setNotice("")} /> : null}

      <div className="tw-app-shell">
        <main id="tw-main" className="tw-main" aria-label={titleFor[activeTab]}>{screen}</main>
        <DesktopAside onNavigate={navigate} onInstall={install} />
      </div>

      <nav className="tw-bottom-nav" role="tablist" aria-label="التنقل الرئيسي">
        {navItems.map((item) => <button key={item.id} type="button" role="tab" aria-selected={selectedNav === item.id} className={selectedNav === item.id ? "is-active" : ""} onClick={() => navigate(item.id)}><Icon name={item.icon} size={20} /><span>{item.title}</span></button>)}
      </nav>
      <footer className="tw-footer"><span>TAHWELATY · واجهات تجريبية</span><span>لا تتصل بأي بنك أو شركة تحصيل</span></footer>

      {splashVisible ? <Splash onSkip={() => setSplashVisible(false)} reducedMotion={reducedMotion} /> : null}
      {pinMode ? <PinDialog mode={pinMode} pendingAction={pendingAction} error={pinError} pinInput={pinInput} newPin={newPin} confirmPin={confirmPin} onPinInput={setPinInput} onNewPin={(value) => { setNewPin(value); setPinError(""); }} onConfirmPin={(value) => { setConfirmPin(value); setPinError(""); }} onSave={saveDemoPin} onVerify={verifyDemoPin} onClose={closePinDialog} onShowNotice={showNotice} /> : null}
      {receipt ? <ReceiptDialog transaction={receipt} onClose={() => setReceipt(null)} /> : null}
      {installHelpOpen ? <InstallHelpDialog isIOS={isIOS} isAndroid={isAndroid} onClose={() => setInstallHelpOpen(false)} /> : null}
    </div>
  );
}
