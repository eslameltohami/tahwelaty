export type TabId = "home" | "pay" | "history" | "security" | "more" | "support" | "fees";

export type BillCategory = "gas" | "electricity" | "water" | "telecom";

export type DemoAction = {
  kind: "تحويل تجريبي" | "سداد فاتورة تجريبي";
  service: string;
  target: string;
  amount: number;
};

export type DemoTransaction = DemoAction & {
  id: string;
  date: string;
  status: "demo";
};

export const DEMO_BALANCE = 12450;

export function maskSensitiveTarget(value: string): string {
  return value.replace(/[0-9٠-٩۰-۹]{4,}/gu, (sequence) => {
    const digits = Array.from(sequence);
    if (digits.length <= 4) return "•".repeat(digits.length);
    return `${digits.slice(0, 2).join("")}${"•".repeat(digits.length - 4)}${digits.slice(-2).join("")}`;
  });
}

/** These are market examples only. No provider integration or commercial agreement exists. */
export const collectionProviderExamples = [
  { name: "فوري", detail: "شبكة دفع إلكتروني وخدمات فواتير" },
  { name: "أمان", detail: "خدمات دفع فواتير ومرافق" },
  { name: "مصاري", detail: "خدمات دفع إلكتروني وتحصيل" },
  { name: "e-Khales", detail: "منصة إلكترونية لدفع الفواتير" },
] as const;

/** Biller names shown for prototype navigation only; none is connected to a live biller. */
export const billers: Record<BillCategory, string[]> = {
  gas: ["بتروتريد", "ناتجاس", "طاقة للغاز"],
  electricity: [
    "شركة شمال القاهرة لتوزيع الكهرباء",
    "شركة جنوب القاهرة لتوزيع الكهرباء",
    "شركة شمال الدلتا لتوزيع الكهرباء",
  ],
  water: [
    "شركة مياه الشرب بالقاهرة",
    "شركة مياه الجيزة",
    "شركة مياه الشرب بالإسكندرية",
  ],
  telecom: [
    "المصرية للاتصالات WE",
    "فودافون مصر",
    "أورنج مصر",
    "اتصالات مصر (e&)",
  ],
};

export const billCategories: { id: BillCategory; title: string; icon: string; accent: string }[] = [
  { id: "gas", title: "الغاز", icon: "flame-outline", accent: "#E9A866" },
  { id: "electricity", title: "الكهرباء", icon: "flash-outline", accent: "#E6CF76" },
  { id: "water", title: "المياه", icon: "water-outline", accent: "#74BFEA" },
  { id: "telecom", title: "الاتصالات والإنترنت", icon: "wifi-outline", accent: "#8CACEF" },
];
