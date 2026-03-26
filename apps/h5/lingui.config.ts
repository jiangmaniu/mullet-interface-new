import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['zh-cn', 'en'],
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
}

export default config
