module.exports = {
  '*.{js,cjs,mjs,ts,vue,json,md,css,yml,yaml}': 'prettier --write',
  '*.{js,cjs,mjs,ts,vue}': 'eslint --fix',
  '*.{css,vue}': 'stylelint --fix',
  'apps/web/src/**/*.{ts,vue,css}': () => 'pnpm --filter @agent-flow/web typecheck',
  'apps/mock-api/src/**/*.ts': () => 'pnpm --filter @agent-flow/mock-api typecheck',
  'packages/contracts/src/**/*.ts': () => 'pnpm --filter @agent-flow/contracts typecheck',
  'packages/ui/src/**/*.{ts,vue,css}': () => 'pnpm --filter @agent-flow/ui typecheck'
};
