import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['en', 'zh-cn'],
  sourceLocale: 'zh-cn',
  fallbackLocales: {
    default: 'zh-cn',
  },
  formatOptions: {
    lineNumbers: false,
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['<rootDir>/src'],
    },
  ],
  format: 'po',
  orderBy: 'messageId',
  rootDir: '.',
  runtimeConfigModule: ['@lingui/core', 'i18n'],
  pseudoLocale: 'pseudo',
}

export default config
