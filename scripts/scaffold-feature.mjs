import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const featureName = args[0];

function readOption(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('');
}

function writeFile(relativePath, content) {
  const filePath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(filePath)) {
    exitWithError(`${relativePath} already exists.`);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

if (!featureName || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(featureName)) {
  exitWithError('Use kebab-case feature names such as approval-center.');
}

const title = readOption('--title', toPascalCase(featureName));
const permission = readOption('--permission', `${featureName}:read`);
if (!/^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/.test(permission)) {
  exitWithError('Use permission codes in domain:action form.');
}

const pascalName = toPascalCase(featureName);
const featureRoot = `apps/web/src/features/${featureName}`;
const pageName = `${pascalName}Page`;
const queryName = `${featureName}-queries`;
const schemaName = `${pascalName}ItemSchema`;

writeFile(
  `${featureRoot}/index.ts`,
  `export { default as ${pageName} } from './pages/${pageName}.vue';\nexport { ${featureName.replaceAll('-', '')}Routes } from './routes';\n`
);

writeFile(
  `${featureRoot}/routes.ts`,
  `import type { RouteRecordRaw } from 'vue-router';\n\nexport const ${featureName.replaceAll('-', '')}Routes: RouteRecordRaw[] = [\n  {\n    path: '/${featureName}',\n    name: '${featureName}',\n    component: () => import('./pages/${pageName}.vue'),\n    meta: {\n      title: '${title}',\n      requiresAuth: true,\n      permissions: ['${permission}'],\n      permissionMode: 'all',\n      layout: 'shell'\n    }\n  }\n];\n`
);

writeFile(
  `${featureRoot}/schema.ts`,
  `import { z } from 'zod';\n\nexport const ${schemaName} = z.object({\n  id: z.string().min(1),\n  title: z.string().min(1),\n  status: z.enum(['draft', 'active', 'archived'])\n});\n\nexport type ${pascalName}Item = z.infer<typeof ${schemaName}>;\n`
);

writeFile(
  `${featureRoot}/queries/${queryName}.ts`,
  `import { useQuery } from '@tanstack/vue-query';\nimport type { ${pascalName}Item } from '../schema';\n\nconst previewItems: ${pascalName}Item[] = [\n  { id: '${featureName}-demo', title: '${title} 示例', status: 'active' }\n];\n\nexport function use${pascalName}ItemsQuery() {\n  return useQuery<${pascalName}Item[]>({\n    queryKey: ['${featureName}', 'items'],\n    queryFn: async () => previewItems,\n    staleTime: 30_000\n  });\n}\n`
);

writeFile(
  `${featureRoot}/pages/${pageName}.vue`,
  `<template>\n  <section class="${featureName}-page">\n    <UiPageHeader eyebrow="Feature" title="${title}" description="按标准模块模板生成的业务入口。" />\n\n    <UiStateBlock\n      v-if="items.length === 0"\n      state="empty"\n      title="暂无${title}数据"\n      description="接入真实接口后，这里展示模块核心列表或工作台。"\n      compact\n    />\n\n    <UiSection v-else title="${title}" meta="${permission}">\n      <UiKeyValueList :items="summaryItems" />\n    </UiSection>\n  </section>\n</template>\n\n<script setup lang="ts">\nimport { computed } from 'vue';\nimport { UiKeyValueList, UiPageHeader, UiSection, UiStateBlock, type UiKeyValueItem } from '@agent-flow/ui';\nimport { use${pascalName}ItemsQuery } from '../queries/${queryName}';\n\nconst itemsQuery = use${pascalName}ItemsQuery();\nconst items = computed(() => itemsQuery.data.value ?? []);\nconst summaryItems = computed<UiKeyValueItem[]>(() => [\n  { label: '记录数', value: String(items.value.length), tone: 'primary' },\n  { label: '权限', value: '${permission}', tone: 'neutral' }\n]);\n</script>\n`
);

writeFile(
  `${featureRoot}/tests/${featureName}.spec.ts`,
  `import { describe, expect, it } from 'vitest';\nimport { ${schemaName} } from '../schema';\nimport { ${featureName.replaceAll('-', '')}Routes } from '../routes';\n\ndescribe('${featureName} scaffold', () => {\n  it('defines route metadata and validates the preview model', () => {\n    expect(${featureName.replaceAll('-', '')}Routes[0].meta?.title).toBe('${title}');\n    expect(${featureName.replaceAll('-', '')}Routes[0].meta?.permissions).toEqual(['${permission}']);\n    expect(${schemaName}.parse({ id: 'demo', title: '${title}', status: 'active' }).status).toBe('active');\n  });\n});\n`
);

console.log(`Scaffolded ${featureName} at ${featureRoot}`);
