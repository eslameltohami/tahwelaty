import type { ReactNode } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#06101B" />
        <meta name="application-name" content="TAHWELATY" />
        <meta name="description" content="معاينة عربية لتجربة تحويلات وسداد فواتير — لا توجد مدفوعات حقيقية." />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="تحويلاتي" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <title>TAHWELATY — تحويلاتي</title>
      </head>
      <body>
        <ScrollViewStyleReset />
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
