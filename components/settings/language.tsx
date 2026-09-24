"use client";

import { useLocale, useTranslations } from 'next-intl';

export function Language() {
  const t = useTranslations('settings.language');
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-4 border-b border-border/50">
        <div>
          <h4 className="text-foreground font-semibold text-sm">Current Language</h4>
          <p className="text-muted-foreground text-xs mt-1">Selected: 
            {locale === 'en' ? 'English (EN)' : locale === 'ha' ? 'Hausa' : locale === 'yo' ? 'Yoruba' : 'Igbo'}
          </p>
        </div>
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">English</span>
      </div>

      <div className="space-y-3">
        <h5 className="text-foreground font-medium text-sm">Available Languages</h5>
        <div className="grid gap-2">
          {[
            { code: 'en', name: 'English' },
            { code: 'ha', name: 'Hausa (coming soon)' },
            { code: 'yo', name: 'Yoruba (coming soon)' },
            { code: 'ig', name: 'Igbo (coming soon)' },
          ].map((lang) => (
            <div
              key={lang.code}
              className={
                `flex items-center justify-between p-3 rounded-lg border transition-colors {
                  lang.code === locale
                    ? 'border-primary bg-primary/10'
                    : lang.code !== 'en'
                      ? 'border-border/50 bg-muted/20 opacity-60'
                      : 'border-border hover:bg-muted/50'
                }`
              }
            >
              <span className="text-sm font-medium {
                lang.code !== 'en' ? 'text-muted-foreground' : 'text-foreground'
              }">
                {lang.name}
              </span>
              {lang.code !== 'en' && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Note: Your selected language is enforced by the URL. To change your language, please navigate to the desired language path.
        </p>
      </div>
    </div>
  );
}