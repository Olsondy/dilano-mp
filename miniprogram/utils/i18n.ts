import commonI18n from '../locales/common';

export type LangType = 'en' | 'zh';
type CommonI18nText = (typeof commonI18n)['en'];
export type I18nDictionary = Record<string, unknown>;
export type I18nMessages<T extends I18nDictionary = Record<string, string>> = {
  [K in keyof T]: string;
};
export type I18nBundle<T extends I18nDictionary = I18nDictionary> = Record<
  LangType,
  I18nMessages<T>
>;

const LANG_STORAGE_KEY = 'user_lang';

export function normalizeLang(lang?: string | null): LangType {
  return typeof lang === 'string' && lang.toLowerCase().includes('zh')
    ? 'zh'
    : 'en';
}

export function detectSystemLang(): LangType {
  try {
    return normalizeLang(wx.getSystemInfoSync().language);
  } catch (_error) {
    return 'en';
  }
}

export function getCurrentLang(): LangType {
  const storedLang = wx.getStorageSync(LANG_STORAGE_KEY);

  if (storedLang) {
    return normalizeLang(String(storedLang));
  }

  const detectedLang = detectSystemLang();
  wx.setStorageSync(LANG_STORAGE_KEY, detectedLang);
  return detectedLang;
}

export function setCurrentLang(lang: LangType): LangType {
  const normalizedLang = normalizeLang(lang);
  wx.setStorageSync(LANG_STORAGE_KEY, normalizedLang);
  return normalizedLang;
}

export function getI18nText<T extends I18nDictionary>(
  pageI18n: I18nBundle<T>,
  lang: LangType,
): I18nMessages<T> & CommonI18nText {
  return {
    ...commonI18n[lang],
    ...pageI18n[lang],
  } as I18nMessages<T> & CommonI18nText;
}

export function buildDisplayId(
  id: string | number | null | undefined,
  lang: LangType,
): string {
  if (id === null || id === undefined || `${id}`.trim() === '') {
    return commonI18n[lang].guestPhone;
  }

  return `${commonI18n[lang].idPrefix}: ${id}`;
}
