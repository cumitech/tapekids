import { notFound } from "next/navigation";

import { LOCALES, type AppLocale } from "@/constants/locales";
import { AppLocaleProvider } from "@/providers/i18n-provider/locale-sync";

export const dynamicParams = true;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!LOCALES.includes(lang as AppLocale)) {
    notFound();
  }

  return (
    <AppLocaleProvider lang={lang as AppLocale}>{children}</AppLocaleProvider>
  );
}
