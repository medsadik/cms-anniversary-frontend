import { useI18n } from "@/lib/i18n/provider"
import { translations } from "@/lib/i18n/translations"

export function useTranslation() {
  const { language } = useI18n()
  return translations[language]
}
