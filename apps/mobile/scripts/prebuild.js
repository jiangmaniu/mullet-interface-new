#!/usr/bin/env node
/**
 * Prebuild script with environment support
 * Usage: pnpm prebuild <env> [options]
 *
 * Examples:
 *   pnpm prebuild dev
 *   pnpm prebuild test
 *   pnpm prebuild prod
 *   pnpm prebuild test --clean
 */

const { spawn } = require('child_process');

const args = process.argv.slice(2);
const env = args[0];
const extraArgs = args.slice(1);

const validEnvs = ['dev', 'test', 'prod'];

if (!env || !validEnvs.includes(env)) {
  console.error(`Usage: pnpm prebuild <env> [options]`);
  console.error(`  env: ${validEnvs.join(' | ')}`);
  console.error(`  options: --clean, --platform ios|android, etc.`);
  console.error(`\nExamples:`);
  console.error(`  pnpm prebuild dev`);
  console.error(`  pnpm prebuild test --clean`);
  console.error(`  pnpm prebuild prod --platform ios`);
  process.exit(1);
}

console.log(`🚀 Running prebuild with ENV=${env}`);

const child = spawn('npx', ['expo', 'prebuild', ...extraArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ENV: env,
  },
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});
