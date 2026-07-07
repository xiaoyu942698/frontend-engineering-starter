import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const sourceRoots = ['apps/web/src', 'apps/mock-api/src', 'packages/contracts/src', 'packages/ui/src'];
const ignoredSegments = new Set([
  'node_modules',
  'dist',
  'coverage',
  'test-results',
  'playwright-report',
  '.codegraph'
]);
const allowedAxiosRoots = ['apps/web/src/shared/api'];
const allowedEnvRoots = ['apps/web/src/shared/config'];
const allowedColorFiles = ['packages/ui/src/styles/tokens.css'];
const duplicateUiFrameworks = new Set([
  'antd',
  '@ant-design/vue',
  'naive-ui',
  'vuetify',
  'quasar',
  'bootstrap',
  '@mui/material',
  '@chakra-ui/vue',
  '@arco-design/web-vue'
]);
const duplicateRequestLibraries = new Set(['ky', 'got', 'superagent', 'request']);
const duplicateStateLibraries = new Set(['redux', '@reduxjs/toolkit', 'zustand', 'jotai', 'recoil']);
const decorativeStyleLibraries = new Set(['framer-motion', 'motion', 'animejs', 'gsap']);
const bannedAgentRuntimeImports = new Set([
  '@langchain/langgraph',
  'langgraph',
  'crewai',
  'mastra',
  '@openai/agents',
  '@google/adk'
]);
const envExampleFiles = ['.env.example', 'apps/web/.env.example'];

const failures = [];
const unsafeHtmlPatterns = [
  {
    regex: /\bv-html\s*=/g,
    filePattern: /\.vue$/,
    message: 'Do not use v-html; render structured content or sanitize through an approved boundary.'
  },
  {
    regex: /\b(?:innerHTML|outerHTML)\s*=/g,
    filePattern: /\.(ts|vue)$/,
    message: 'Do not assign HTML strings directly; render structured content or sanitize through an approved boundary.'
  },
  {
    regex: /\binsertAdjacentHTML\s*\(/g,
    filePattern: /\.(ts|vue)$/,
    message: 'Do not inject HTML strings directly; render structured content or sanitize through an approved boundary.'
  }
];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function getRelative(filePath) {
  return toPosix(path.relative(rootDir, filePath));
}

function isIgnored(filePath) {
  return filePath.split(path.sep).some((segment) => ignoredSegments.has(segment));
}

function listFiles(dir, matcher) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (isIgnored(entryPath)) return [];
    if (entry.isDirectory()) return listFiles(entryPath, matcher);
    return matcher(entry.name) ? [entryPath] : [];
  });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function getLine(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function report(filePath, line, message) {
  failures.push(`${getRelative(filePath)}:${line}: ${message}`);
}

function isWithin(relativePath, roots) {
  return roots.some((root) => relativePath === root || relativePath.startsWith(`${root}/`));
}

function resolveImportPath(filePath, importSource) {
  if (importSource.startsWith('@/')) {
    return `apps/web/src/${importSource.slice(2)}`;
  }

  if (importSource.startsWith('.')) {
    const baseDir = path.dirname(getRelative(filePath));
    return toPosix(path.normalize(path.join(baseDir, importSource)));
  }

  return null;
}

function getFeatureName(relativePath) {
  const match = relativePath.match(/^apps\/web\/src\/features\/([^/]+)\//);
  return match?.[1] ?? null;
}

function extractImportSources(content) {
  const imports = [];
  const importRegex = /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const dynamicImportRegex = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const match of content.matchAll(importRegex)) {
    imports.push({ source: match[1], index: match.index });
  }

  for (const match of content.matchAll(dynamicImportRegex)) {
    imports.push({ source: match[1], index: match.index });
  }

  return imports;
}

function checkArchitectureImports(filePath, content) {
  const relativePath = getRelative(filePath);
  const currentFeature = getFeatureName(relativePath);

  for (const { source, index } of extractImportSources(content)) {
    if (source === 'axios' && !isWithin(relativePath, allowedAxiosRoots)) {
      report(
        filePath,
        getLine(content, index),
        'HTTP calls must go through shared/api instead of direct axios imports.'
      );
    }

    if (bannedAgentRuntimeImports.has(source)) {
      report(
        filePath,
        getLine(content, index),
        'Agent runtime SDK imports must stay behind RuntimeAdapter boundaries.'
      );
    }

    if (
      relativePath.startsWith('packages/ui/src/') &&
      (source.startsWith('@/') || source === '@agent-flow/contracts')
    ) {
      report(
        filePath,
        getLine(content, index),
        'packages/ui must stay framework-generic and cannot import app or contract modules.'
      );
    }

    if (
      relativePath.startsWith('packages/contracts/src/') &&
      (source.startsWith('@/') || source === '@agent-flow/ui')
    ) {
      report(filePath, getLine(content, index), 'packages/contracts must not depend on app or UI modules.');
    }

    const resolvedPath = resolveImportPath(filePath, source);
    const targetFeature = resolvedPath ? getFeatureName(resolvedPath) : null;
    if (currentFeature && targetFeature && currentFeature !== targetFeature) {
      report(
        filePath,
        getLine(content, index),
        'Feature modules must not import another feature private path directly.'
      );
    }
  }

  const envRegex = /import\.meta\.env/g;
  for (const match of content.matchAll(envRegex)) {
    if (!isWithin(relativePath, allowedEnvRoots)) {
      report(filePath, getLine(content, match.index), 'Read environment variables through shared/config/env only.');
    }
  }
}

function extractVueStyleBlocks(content) {
  const blocks = [];
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/g;

  for (const match of content.matchAll(styleRegex)) {
    blocks.push({
      text: match[1],
      offset: match.index + match[0].indexOf(match[1])
    });
  }

  return blocks;
}

function checkCssTokens(filePath, content, offset = 0) {
  const relativePath = getRelative(filePath);
  if (allowedColorFiles.includes(relativePath)) return;

  const hardcodedColorRegex = /(?:#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/g;
  for (const match of content.matchAll(hardcodedColorRegex)) {
    report(filePath, getLine(content, match.index + offset), 'Use design tokens instead of hardcoded color values.');
  }
}

function checkUnsafeHtmlUsage(filePath, content) {
  const relativePath = getRelative(filePath);

  for (const { regex, filePattern, message } of unsafeHtmlPatterns) {
    if (!filePattern.test(relativePath)) continue;

    for (const match of content.matchAll(regex)) {
      report(filePath, getLine(content, match.index), message);
    }
  }
}

function isTruthyEnvValue(value) {
  return ['1', 'true', 'yes', 'on'].includes(
    String(value ?? '')
      .trim()
      .toLowerCase()
  );
}

function findEnvAssignment(content, variableName) {
  const lines = content.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const match = line.match(new RegExp(`^\\s*${variableName}\\s*=\\s*([^#\\r\\n]*)`));
    if (match) {
      return {
        line: index + 1,
        value: match[1].trim()
      };
    }
  }

  return null;
}

function checkMockAuthExampleDefault(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) return;

  const assignment = findEnvAssignment(readFile(filePath), 'VITE_ENABLE_MOCK_AUTH');
  if (assignment && isTruthyEnvValue(assignment.value)) {
    report(filePath, assignment.line, 'Mock auth must default to false in committed env examples.');
  }
}

function checkProtectedMockAuthEnv() {
  const isProtectedGate = isTruthyEnvValue(process.env.CI) || process.env.NODE_ENV === 'production';
  if (isProtectedGate && isTruthyEnvValue(process.env.VITE_ENABLE_MOCK_AUTH)) {
    failures.push('process.env:1: VITE_ENABLE_MOCK_AUTH must be false in CI or production gates.');
  }
}

function readPackageJson(filePath) {
  try {
    return JSON.parse(readFile(filePath));
  } catch (error) {
    report(filePath, 1, `Invalid package.json: ${error.message}`);
    return {};
  }
}

function checkDependencyPolicy(filePath) {
  const packageJson = readPackageJson(filePath);
  const dependencySets = [
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.optionalDependencies
  ].filter(Boolean);

  for (const dependencies of dependencySets) {
    for (const dependencyName of Object.keys(dependencies)) {
      if (duplicateUiFrameworks.has(dependencyName)) {
        report(filePath, 1, `Duplicate UI framework dependency "${dependencyName}" is not allowed; use Element Plus.`);
      }

      if (duplicateRequestLibraries.has(dependencyName)) {
        report(
          filePath,
          1,
          `Duplicate request dependency "${dependencyName}" is not allowed; use Axios through shared/api.`
        );
      }

      if (duplicateStateLibraries.has(dependencyName)) {
        report(filePath, 1, `Duplicate state dependency "${dependencyName}" is not allowed; use Pinia and Vue Query.`);
      }

      if (decorativeStyleLibraries.has(dependencyName)) {
        report(filePath, 1, `Decorative animation dependency "${dependencyName}" requires architecture approval.`);
      }
    }
  }
}

const sourceFiles = sourceRoots.flatMap((sourceRoot) =>
  listFiles(path.join(rootDir, sourceRoot), (fileName) => /\.(ts|vue|css)$/.test(fileName))
);
const packageFiles = [
  'package.json',
  'apps/web/package.json',
  'apps/mock-api/package.json',
  'packages/ui/package.json',
  'packages/contracts/package.json'
]
  .map((relativePath) => path.join(rootDir, relativePath))
  .filter((filePath) => fs.existsSync(filePath));

for (const filePath of sourceFiles) {
  const content = readFile(filePath);

  if (/\.(ts|vue)$/.test(filePath)) {
    checkArchitectureImports(filePath, content);
    checkUnsafeHtmlUsage(filePath, content);
  }

  if (filePath.endsWith('.css')) {
    checkCssTokens(filePath, content);
  }

  if (filePath.endsWith('.vue')) {
    for (const styleBlock of extractVueStyleBlocks(content)) {
      checkCssTokens(filePath, styleBlock.text, styleBlock.offset);
    }
  }
}

for (const packageFile of packageFiles) {
  checkDependencyPolicy(packageFile);
}

for (const envExampleFile of envExampleFiles) {
  checkMockAuthExampleDefault(envExampleFile);
}

checkProtectedMockAuthEnv();

if (failures.length > 0) {
  console.error('Engineering rule check failed:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Engineering rule check passed.');
