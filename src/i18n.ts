import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/en/common.json";
import ru from "@/i18n/ru/common.json";

void i18next.use(initReactI18next).init({
  resources: {
    ru: { common: ru },
    en: { common: en }
  },
  lng: "ru",
  fallbackLng: "ru",
  supportedLngs: ["ru", "en"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});
