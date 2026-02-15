import 'server-only';
import type { Locale } from './i18n-config';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
  hi: () => import('./dictionaries/hi.json').then((module) => module.default),
  te: () => import('./dictionaries/te.json').then((module) => module.default),
  ta: () => import('./dictionaries/ta.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return locale in dictionaries ? dictionaries[locale]() : dictionaries.en();
}
