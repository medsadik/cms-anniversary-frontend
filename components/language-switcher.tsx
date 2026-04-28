"use client"

import { useI18n } from "@/lib/i18n/provider"

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  const toggle = () => setLanguage(language === "en" ? "fr" : "en")

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md px-2 py-1 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      title="Switch language"
    >
      {language === "en" ? "FR" : "EN"}
    </button>
  )
}
