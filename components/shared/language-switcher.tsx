"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLanguageChange = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  const currentLocale = typeof document !== 'undefined' 
    ? document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/)?.[1] || "en" 
    : "en";


import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
    setIsOpen(false);
  };


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}

        className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-full transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
        aria-label="Switch language"
      >
        <Globe className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50">
          <div className="py-1">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                {locale.name}
                {currentLocale === locale.code && <Check className="h-4 w-4" />}

        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors"
        aria-label={t('label')}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m0 14h12m-6-4v4m-3-12h6a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {locale === 'en' ? 'English (EN)' : locale === 'ha' ? 'Hausa' : locale === 'yo' ? 'Yoruba' : 'Igbo'}
        <svg
          className="w-3 h-3 transition-transform {
  isOpen ? 'rotate-180' : ''
}"          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {['en', 'ha', 'yo', 'ig'].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={
                  `w-full text-left px-4 py-2 text-sm transition-colors {
                    lang === locale
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`
                }
              >
                {localeLabels[lang as keyof typeof localeLabels]}

              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}

}


