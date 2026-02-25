module.exports = {
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    semi: 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'trailing-comma': 'off', // 末尾不需要逗号
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',
    'eslint-disable-next-line': 'off',
    'import/no-anonymous-default-export': 'off',
    'react-hooks/rules-of-hooks': 'off'
  },
  globals: {
    JSX: true
  }
}
