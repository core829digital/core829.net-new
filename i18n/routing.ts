import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "it",
  "ro",
  "fr",
  "de",
  "nl",
  "es",
  "pt",
  "pl",
  "cs",
  "sk",
  "hu",
  "ru",
  "uk",
  "bg",
  "el",
  "tr",
  "sv",
  "da",
  "no",
  "fi",
  "zh",
  "ja",
  "ko",
] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  ro: "Română",
  fr: "Français",
  de: "Deutsch",
  nl: "Nederlands",
  es: "Español",
  pt: "Português",
  pl: "Polski",
  cs: "Čeština",
  sk: "Slovenčina",
  hu: "Magyar",
  ru: "Русский",
  uk: "Українська",
  bg: "Български",
  el: "Ελληνικά",
  tr: "Türkçe",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "it",
  localePrefix: "always",
});
