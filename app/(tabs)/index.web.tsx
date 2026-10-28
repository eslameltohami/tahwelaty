import "@/components/tahwelaty-web/styles.css";
import TahwelatyWebApp from "@/components/tahwelaty-web/App";
import Head from "expo-router/head";

export default function TahwelatyWebRoute() {
  return (
    <>
      <Head>
        <title>TAHWELATY — تحويلاتي</title>
        <meta name="description" content="معاينة عربية لتجربة تحويلات وسداد فواتير — لا توجد مدفوعات حقيقية." />
      </Head>
      <TahwelatyWebApp />
    </>
  );
}
