import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ar } from "./ar";
import { en } from "./en";

type Translations = typeof ar;
type Language = "ar" | "en";

interface I18nContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  dir: "rtl" | "ltr";
}

const translations: Record<Language, Translations> = { ar, en };

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  t: ar,
  setLang: () => {},
  dir: "rtl",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("dashboard_lang") as Language;
    return saved === "en" ? "en" : "ar";
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("dashboard_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  }, []);

  const value: I18nContextType = {
    lang,
    t: translations[lang],
    setLang,
    dir: lang === "ar" ? "rtl" : "ltr",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
