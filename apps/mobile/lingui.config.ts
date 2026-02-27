import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['en', 'zh-cn'],
  sourceLocale: 'zh-cn',
  fallbackLocales: {
    default: 'zh-cn',
  },
  catalogs: [
    {
      path: '<rootDir>/src/locales/{locale}/messages',
      include: ['<rootDir>/src'],
    },
  ],
  format: 'po',
}

export default config
