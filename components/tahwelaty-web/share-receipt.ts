import { captureRef } from "react-native-view-shot";

export type ReceiptShareResult = "shared" | "downloaded" | "cancelled";

type FileShareNavigator = Navigator & {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { title: string; text: string; files: File[] }) => Promise<void>;
};

export async function shareReceiptPng(element: HTMLElement, fileName: string): Promise<ReceiptShareResult> {
  const bounds = element.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) throw new Error("Receipt is not visible.");

  const width = 1080;
  const height = Math.max(1, Math.round((width * bounds.height) / bounds.width));
  const dataUri = await captureRef(element, {
    format: "png",
    quality: 1,
    result: "data-uri",
    width,
    height,
  });
  const response = await fetch(dataUri);
  if (!response.ok) throw new Error("Unable to render receipt image.");
  const blob = await response.blob();
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "-");
  const file = new File([blob], safeName.endsWith(".png") ? safeName : `${safeName}.png`, { type: "image/png" });
  const fileNavigator = navigator as FileShareNavigator;

  if (fileNavigator.share && fileNavigator.canShare?.({ files: [file] })) {
    try {
      await fileNavigator.share({
        title: "إيصال محاكاة TAHWELATY",
        text: "تجريبي — غير صالح كإثبات دفع. لم يتم تنفيذ أي معاملة.",
        files: [file],
      });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  return "downloaded";
}
