export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'hi', 'te', 'ta'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
