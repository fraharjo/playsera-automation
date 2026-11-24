import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  scenario: string;
  missing: string[];
}

function extractTags(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_-]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

const targetArg = process.argv[2];
const targetFiles: { displayPath: string; fullPath: string }[] = [];

function collectTestFiles(dir: string, baseDir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      collectTestFiles(full, baseDir);
    } else if (entry.isFile() && (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.feature'))) {
      targetFiles.push({
        displayPath: path.relative(baseDir, full),
        fullPath: full,
      });
    }
  }
}

if (targetArg) {
  const resolved = path.resolve(targetArg);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Target path not found: ${targetArg}`);
    process.exit(1);
  }
  if (fs.statSync(resolved).isFile()) {
    targetFiles.push({ displayPath: targetArg, fullPath: resolved });
  } else {
    collectTestFiles(resolved, resolved);
  }
} else {
  const testsDir = path.join(process.cwd(), 'tests');
  collectTestFiles(testsDir, process.cwd());
}

const violations: Violation[] = [];
let totalTests = 0;

for (const { displayPath, fullPath } of targetFiles) {
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  let suiteTags: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check test.describe for suite-level tags
    const describeMatch = line.match(/test\.describe(?:\.parallel|\.serial)?\s*\(\s*['"`](.*?)['"`]/);
    if (describeMatch) {
      let describeBlock = line;
      for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
        describeBlock += ' ' + lines[k].trim();
        if (lines[k].includes('=>') || lines[k].includes('{')) break;
      }
      suiteTags = extractTags(describeBlock);
    }

    // Check test('...', { tag: [...] } or test('... @tag', ...)
    const testMatch = line.match(/(?:test|it)\s*\(\s*['"`](.*?)['"`]/);
    if (testMatch) {
      totalTests++;
      const title = testMatch[1].trim();

      // Slurp header forward until 'async' or '=>'
      let headerBlock = line;
      for (let k = i; k < Math.min(i + 10, lines.length); k++) {
        headerBlock += ' ' + lines[k].trim();
        if (lines[k].includes('async') || lines[k].includes('=>') || lines[k].includes('function')) {
          i = k;
          break;
        }
      }

      const effectiveTags = Array.from(new Set([
        ...suiteTags,
        ...extractTags(headerBlock),
      ]));

      const missing: string[] = [];

      // Rule 1: Execution mode (@automated or @manual)
      if (!effectiveTags.includes('@automated') && !effectiveTags.includes('@manual')) {
        missing.push('Execution mode (@automated or @manual)');
      }

      // Rule 2: Module tag (@feature-<name>)
      if (!effectiveTags.some((t) => t.startsWith('@feature-'))) {
        missing.push('Module tag (@feature-<name>)');
      }

      // Rule 3: Platform tag (@web, @api, or @mobile-web)
      const hasPlatform = effectiveTags.includes('@web') || effectiveTags.includes('@api') || effectiveTags.includes('@mobile-web');
      if (!hasPlatform) {
        missing.push('Platform tag (@web, @api, or @mobile-web)');
      }

      // Rule 4: Runner filter tag for automated tests (@smoke, @regression, or @e2e)
      if (effectiveTags.includes('@automated')) {
        const hasRunner = effectiveTags.includes('@smoke') || effectiveTags.includes('@regression') || effectiveTags.includes('@e2e');
        if (!hasRunner) {
          missing.push('Runner filter tag (@smoke, @regression, or @e2e)');
        }
      }

      if (missing.length > 0) {
        violations.push({
          file: displayPath,
          scenario: title,
          missing,
        });
      }
    }
  }
}

console.log(`\n🔍 Checked ${totalTests} test cases across ${targetFiles.length} file(s).`);

if (violations.length > 0) {
  console.error(`\n⚠️  Found ${violations.length} test(s) missing mandatory runner tags (risking silent skip in CI):\n`);
  for (const v of violations) {
    console.error(`  📄 ${v.file}`);
    console.error(`     Test: "${v.scenario}"`);
    console.error(`     Missing: ${v.missing.join(', ')}\n`);
  }
  process.exit(1);
} else {
  console.log('✅ All tests adhere to the mandatory tag taxonomy perfectly!\n');
}
