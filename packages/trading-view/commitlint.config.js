module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [1, 'always', 100],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'test', 'doc', 'refactor', 'style', 'revert', 'delete', 'font', 'stash', 'conflict', 'ci', 'build', 'docs']
    ]
  }
}
