module.exports = {
  '**/*.(ts|tsx)': () => ['npx tsc --noEmit', 'npx eslint --fix src'],
  '**/*.(ts|tsx|md|json)': () => `npx prettier --write src`
}
