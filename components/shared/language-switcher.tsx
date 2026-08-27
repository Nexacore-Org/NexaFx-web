"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";

const LOCALES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
