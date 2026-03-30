import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/assets/i18n/en.json';
import zh from '@/assets/i18n/zh.json';
import { env, storageKeys } from '@/lib/env';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

const initialLanguage = localStorage.getItem(storageKeys.language) || env.defaultLanguage;

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', language => {
  localStorage.setItem(storageKeys.language, language);
});

export default i18n;
