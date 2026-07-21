import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/en/common.json";
import ru from "@/i18n/ru/common.json";
import { getPlatformLocaleFallback } from "@/shared/lib/locale";

const fallbackLocale = getPlatformLocaleFallback();

void i18next.use(initReactI18next).init({
  resources: {
    ru: { common: ru },
    en: { common: en }
  },
  lng: fallbackLocale,
  fallbackLng: fallbackLocale,
  supportedLngs: ["ru", "en"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});
