import { defineConfig } from '@lingui/cli'
import type { LinguiConfig } from '@lingui/conf'

import { DEFAULT_LOCALE, LOCALES } from './src/constants/locale'

const config: LinguiConfig = defineConfig({
  locales: LOCALES,
  sourceLocale: DEFAULT_LOCALE,
  fallbackLocales: {
    default: DEFAULT_LOCALE,
  },
  formatOptions: {
    lineNumbers: false,
  },
  format: 'po',

  catalogs: [
    {
      path: '<rootDir>/src/locales/messages/{locale}/common',
      include: ['<rootDir>/src'],
    },
  ],

  orderBy: 'messageId',
  rootDir: '.',
  runtimeConfigModule: ['@lingui/core', 'i18n'],
  pseudoLocale: 'pseudo',
})

export default config
