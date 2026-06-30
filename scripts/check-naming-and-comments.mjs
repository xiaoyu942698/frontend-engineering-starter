import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const sourceRoots = ['apps/web/src', 'apps/mock-api/src', 'packages/contracts/src', 'packages/ui/src'];
const ignoredSegments = new Set([
  'node_modules',
  'dist',
  'coverage',
  'test-results',
  'playwright-report',
  '.codegraph',
  '.codex-temp'
]);
const classNamePattern =
  /^(?:ui|app|agent|studio|surface|task|message|session|workflow|audit|adapter|resource|catalog|approval|artifact|canvas|composer|overview|sidebar|brand|nav|capability|node|is|has|el|vue-flow|muted)[a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const functionNamePattern =
  /^(?:use|fetch|list|get|find|create|update|delete|remove|submit|cancel|request|map|format|normalize|parse|resolve|build|read|write|sync|handle|is|has|can|should|load|run|mount|apply|render|validate|assert|set|clear|toggle|start|stop|open|close|matches)[A-Z0-9_]?.*/;
const allowedFrameworkFunctionNames = new Set(['mounted', 'updated', 'observe', 'unobserve', 'disconnect']);
const publicApiDocRoots = [
  'apps/web/src/shared',
  'apps/web/src/stores',
  'apps/web/src/features/studio/queries',
  'apps/mock-api/src/runtime.ts',
  'packages/ui/src/types.ts'
];
const commentDensityRoots = [
  'apps/web/src/shared',
  'apps/web/src/stores',
  'apps/mock-api/src/runtime.ts',
  'packages/contracts/src/index.ts'
];
const maxFileBytes = 80 * 1024;
const lineLimitRules = [
  { extensions: ['.vue'], maxLines: 420, label: 'Vue SFC' },
  { extensions: ['.ts'], maxLines: 320, label: 'TypeScript source' },
  { extensions: ['.css'], maxLines: 700, label: 'CSS source' }
];

const failures = [];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function isIgnored(filePath) {
  return filePath.split(path.sep).some((segment) => ignoredSegments.has(segment));
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (isIgnored(entryPath)) return [];
    if (entry.isDirectory()) return listFiles(entryPath);
    if (/\.(ts|vue|css)$/.test(entry.name)) return [entryPath];
    return [];
  });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function report(filePath, line, message) {
  failures.push(`${toPosix(path.relative(rootDir, filePath))}:${line}: ${message}`);
}

function getLine(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function extractVueScript(content) {
  const match = content.match(/<script(?:\s+setup)?(?:\s+lang="ts")?[^>]*>([\s\S]*?)<\/script>/);
  return match ? { text: match[1], offset: match.index + match[0].indexOf(match[1]) } : null;
}

function checkClassName(filePath, className, line) {
  if (!classNamePattern.test(className)) {
    report(filePath, line, `Invalid class name "${className}". Use an approved namespace and kebab/BEM form.`);
  }
}

function checkTemplateClassNames(filePath, content) {
  const staticClassRegex = /(?:^|\s)class="([^"]+)"/g;
  for (const match of content.matchAll(staticClassRegex)) {
    const line = getLine(content, match.index);
    for (const className of match[1].split(/\s+/).filter(Boolean)) {
      checkClassName(filePath, className, line);
    }
  }

  const dynamicClassRegex = /:class="\{([^"]+)\}"/g;
  for (const classBlock of content.matchAll(dynamicClassRegex)) {
    const objectClassRegex = /['"]([a-zA-Z][a-zA-Z0-9_-]*(?:__[a-zA-Z0-9-]+)?(?:--[a-zA-Z0-9-]+)?)['"]\s*:/g;
    for (const match of classBlock[1].matchAll(objectClassRegex)) {
      checkClassName(filePath, match[1], getLine(content, classBlock.index));
    }
  }
}

function checkCssClassNames(filePath, content) {
  const cssClassRegex = /(?<![\w'"])\\.([a-zA-Z][a-zA-Z0-9_-]*(?:__[a-zA-Z0-9-]+)?(?:--[a-zA-Z0-9-]+)?)/g;
  for (const match of content.matchAll(cssClassRegex)) {
    checkClassName(filePath, match[1], getLine(content, match.index));
  }
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function hasTsDoc(content, sourceFile, node) {
  const leading = content.slice(node.getFullStart(), node.getStart(sourceFile));
  return /\/\*\*[\s\S]*\*\/\s*$/.test(leading);
}

function shouldRequirePublicApiDocs(filePath) {
  const relative = toPosix(path.relative(rootDir, filePath));
  return publicApiDocRoots.some((root) => relative === root || relative.startsWith(`${root}/`));
}

function shouldCheckCommentDensity(filePath) {
  const relative = toPosix(path.relative(rootDir, filePath));
  return commentDensityRoots.some((root) => relative === root || relative.startsWith(`${root}/`));
}

function checkFunctionName(filePath, content, node, name) {
  if (allowedFrameworkFunctionNames.has(name)) return;
  if (!functionNamePattern.test(name)) {
    report(
      filePath,
      getLine(content, node.getStart()),
      `Function "${name}" must start with an approved action prefix.`
    );
  }
}

function visitTypeScript(filePath, content, scriptOffset = 0) {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      checkFunctionName(filePath, content, node, node.name.text);

      if (hasExportModifier(node) && shouldRequirePublicApiDocs(filePath) && !hasTsDoc(content, sourceFile, node)) {
        report(
          filePath,
          getLine(content, node.getStart()),
          `Exported function "${node.name.text}" must have a TSDoc block.`
        );
      }
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
        checkFunctionName(filePath, content, node, node.name.text);
      }
    }

    if (
      (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name
    ) {
      if (hasExportModifier(node) && shouldRequirePublicApiDocs(filePath) && !hasTsDoc(content, sourceFile, node)) {
        report(
          filePath,
          getLine(content, node.getStart()),
          `Exported ${ts.SyntaxKind[node.kind]} "${node.name.text}" must have a TSDoc block.`
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (scriptOffset > 0) {
    return;
  }
}

function checkTodoAndCommentedCode(filePath, content) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/\bTODO\b/.test(line) && !/\bTODO\([a-z0-9-]+\):/.test(line)) {
      report(filePath, index + 1, 'TODO comments must use TODO(scope): message format.');
    }

    if (/^\s*\/\/\s*(?:const|let|var|function|return|if|for|while|switch|import|export|<\w|<\/\w|\})\b/.test(line)) {
      report(filePath, index + 1, 'Commented-out code is not allowed.');
    }
  });
}

function checkCommentDensity(filePath, content) {
  if (!shouldCheckCommentDensity(filePath) || !filePath.endsWith('.ts')) return;

  const lines = content.split(/\r?\n/);
  const meaningfulLines = lines.filter((line) => line.trim()).length;
  if (meaningfulLines < 80) return;

  let inBlock = false;
  let commentLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (inBlock) {
      commentLines += 1;
      if (trimmed.includes('*/')) inBlock = false;
      continue;
    }

    if (trimmed.startsWith('//')) {
      commentLines += 1;
      continue;
    }

    if (trimmed.startsWith('/*')) {
      commentLines += 1;
      if (!trimmed.includes('*/')) inBlock = true;
    }
  }

  const density = commentLines / meaningfulLines;
  if (density < 0.02) {
    report(
      filePath,
      1,
      `Comment density ${(density * 100).toFixed(1)}% is below the 2% minimum for foundation TS files.`
    );
  }

  if (density > 0.25) {
    report(
      filePath,
      1,
      `Comment density ${(density * 100).toFixed(1)}% is above the 25% maximum; remove noisy comments.`
    );
  }
}

function resolveLineLimit(filePath) {
  return lineLimitRules.find((rule) => rule.extensions.some((extension) => filePath.endsWith(extension))) ?? null;
}

function formatBytes(byteCount) {
  return `${(byteCount / 1024).toFixed(1)}KB`;
}

function checkFileSize(filePath, content) {
  const lineLimit = resolveLineLimit(filePath);
  if (lineLimit) {
    const lineCount = content.split(/\r?\n/).length;
    if (lineCount > lineLimit.maxLines) {
      report(
        filePath,
        lineLimit.maxLines + 1,
        `${lineLimit.label} has ${lineCount} lines and exceeds the ${lineLimit.maxLines} line limit. Split by feature, state, query, style layer, or child component.`
      );
    }
  }

  const byteCount = Buffer.byteLength(content, 'utf8');
  if (byteCount > maxFileBytes) {
    report(
      filePath,
      1,
      `File size ${formatBytes(byteCount)} exceeds the ${formatBytes(maxFileBytes)} limit. Split the file before merging.`
    );
  }
}

const files = sourceRoots.flatMap((sourceRoot) => listFiles(path.join(rootDir, sourceRoot)));

for (const filePath of files) {
  const content = readFile(filePath);
  checkFileSize(filePath, content);
  checkTodoAndCommentedCode(filePath, content);

  if (filePath.endsWith('.vue')) {
    checkTemplateClassNames(filePath, content);
    const script = extractVueScript(content);
    if (script) visitTypeScript(filePath, script.text, script.offset);
  }

  if (filePath.endsWith('.css')) {
    checkCssClassNames(filePath, content);
  }

  if (filePath.endsWith('.ts')) {
    visitTypeScript(filePath, content);
    checkCommentDensity(filePath, content);
  }
}

if (failures.length > 0) {
  console.error('Naming/comment standard check failed:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('Naming/comment standard check passed.');
