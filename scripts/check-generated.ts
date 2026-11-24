/**
 * check-generated.ts - mechanical self-check for a generated test-design draft in Playsera.
 *
 * Usage:   npm run check:generated -- generated/<feature>
 * Wire it: "check:generated": "ts-node scripts/check-generated.ts"
 *
 * Input: a folder holding <feature>.spec.ts (or <feature>.feature) and test-matrix.md.
 * Exit code 1 when any ERROR is found. WARN lines are advisory.
 * Zero dependencies. Keeps rules in sync with SKILL.md.
 */
import fs from 'node:fs';
import path from 'node:path';

type Scenario = {
  title: string;
  outline: boolean;
  line: number;
  tags: string[]; // effective tags (Suite + Scenario)
  comments: string[]; // comment lines directly above the scenario/test
  bodyText: string;
};

type Parsed = { suiteTags: string[]; scenarios: Scenario[] };

// ---- taxonomy (mirror of SKILL.md) -----------------------------------------
const PRIORITY = ['@p0', '@p1', '@p2'];
const EXECUTION = ['@automated', '@manual'];
const PLATFORM = ['@web', '@api', '@mobile-web'];
const TYPE = [
  '@positive',
  '@negative',
  '@bva',
  '@functional',
  '@security',
  '@permission',
  '@lifecycle',
  '@network',
  '@concurrency',
  '@localization',
  '@accessibility',
];
const RUNNER = ['@smoke', '@regression', '@e2e'];
const STATUS = ['@assumption', '@blocked', '@derived'];
const OTHER_ALLOWED = ['@api'];
const PATTERNS: RegExp[] = [
  /^@REQ-[\w-]+$/,
  /^@AC-\d{2}$/,
  /^@JIRA-[\w-]+$/,
  /^@feature-[\w-]+$/,
];
const KNOWN = new Set([
  ...PRIORITY,
  ...EXECUTION,
  ...PLATFORM,
  ...TYPE,
  ...RUNNER,
  ...STATUS,
  ...OTHER_ALLOWED,
]);
const DERIVED_CAP = 5;

// ---- phrase rules ------------------------------------------------------------
const PLACEHOLDER: RegExp[] = [
  /according to (the |a |an )?(confirmed|agreed|defined|documented|expected|specified|applicable)/i,
  /\bper (the )?(policy|policies|rules?|spec|specification)\b/i,
  /\b(handled?|handles)\s+(safely|appropriately|properly|correctly|gracefully)\b/i,
  /\bas (defined|specified|expected|agreed)\b/i,
  /\bwithout (data corruption|unexpected)/i,
];
const CREDENTIAL = /\b(password|passwd|pin|token|secret|api[ _-]?key)\b\s*(?:is|=|:)?\s*["'][^"']{3,}["']/i;

// ---- parsers -------------------------------------------------------------------
function extractTags(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_-]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Parses Playwright spec files (*.spec.ts)
 */
function parseSpecFile(content: string): Parsed {
  const lines = content.split(/\r?\n/);
  const out: Parsed = { suiteTags: [], scenarios: [] };
  let pendingComments: string[] = [];
  let currentSuiteTags: string[] = [];

  let inTest = false;
  let currentTest: {
    title: string;
    line: number;
    tags: string[];
    comments: string[];
    bodyLines: string[];
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNo = i + 1;

    if (!line) continue;

    // Track comments
    if (line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || line.startsWith('*')) {
      pendingComments.push(line);
      continue;
    }

    // Match test.describe
    const describeMatch = line.match(/test\.describe(?:\.parallel|\.serial)?\s*\(\s*['"`](.*?)['"`]/);
    if (describeMatch) {
      // Look forward up to 5 lines for suite tags
      let describeBlock = line;
      for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
        describeBlock += ' ' + lines[k].trim();
        if (lines[k].includes('=>') || lines[k].includes('{')) break;
      }
      currentSuiteTags = extractTags(describeBlock);
      out.suiteTags = currentSuiteTags;
      pendingComments = [];
      continue;
    }

    // Match start of test or it
    const testMatch = line.match(/(?:test|it)\s*\(\s*['"`](.*?)['"`]/);
    if (testMatch) {
      inTest = true;
      const title = testMatch[1].trim();

      // Slurp header forward until 'async' or '=>' or function body starts to capture all tags
      let headerBlock = line;
      let headerEndIndex = i;
      for (let k = i; k < Math.min(i + 10, lines.length); k++) {
        headerBlock += ' ' + lines[k].trim();
        if (lines[k].includes('async') || lines[k].includes('=>') || lines[k].includes('function')) {
          headerEndIndex = k;
          break;
        }
      }

      const scenarioTags = Array.from(new Set([
        ...currentSuiteTags,
        ...extractTags(headerBlock),
      ]));

      currentTest = {
        title,
        line: lineNo,
        tags: scenarioTags,
        comments: [...pendingComments],
        bodyLines: [],
      };

      out.scenarios.push({
        title,
        outline: false,
        line: lineNo,
        tags: scenarioTags,
        comments: [...pendingComments],
        bodyText: '',
      });

      pendingComments = [];
      i = headerEndIndex; // jump to end of header
      continue;
    }

    // Accumulate body if inside test
    if (inTest && currentTest) {
      if (line.startsWith('test(') || line.startsWith('test.describe(')) {
        inTest = false;
        currentTest = null;
        i--; // reprocess this line
        continue;
      }
      const last = out.scenarios[out.scenarios.length - 1];
      if (last) {
        last.bodyText += '\n' + raw;
      }
    }
  }

  return out;
}

/**
 * Parses Cucumber Gherkin (*.feature) if present
 */
function parseFeatureFile(text: string): Parsed {
  const lines = text.split(/\r?\n/);
  const out: Parsed = { suiteTags: [], scenarios: [] };
  let pendingTags: string[] = [];
  let pendingComments: string[] = [];
  let cur: Scenario | null = null;

  lines.forEach((raw, i) => {
    const l = raw.trim();
    const no = i + 1;
    if (!l) return;
    if (l.startsWith('#')) {
      pendingComments.push(l);
      return;
    }
    if (l.startsWith('@')) {
      pendingTags.push(...extractTags(l));
      return;
    }
    if (/^Feature:/i.test(l)) {
      out.suiteTags = pendingTags;
      pendingTags = [];
      pendingComments = [];
      return;
    }
    const sc = l.match(/^Scenario( Outline| Template)?:\s*(.*)/i);
    if (sc) {
      cur = {
        title: (sc[2] ?? '').trim(),
        outline: !!sc[1],
        line: no,
        tags: [...out.suiteTags, ...pendingTags],
        comments: pendingComments,
        bodyText: '',
      };
      out.scenarios.push(cur);
      pendingTags = [];
      pendingComments = [];
      return;
    }
    if (cur) {
      cur.bodyText += '\n' + l;
    }
    pendingComments = [];
  });
  return out;
}

// ---- checks ---------------------------------------------------------------------
const errors: string[] = [];
const warns: string[] = [];
const err = (line: number, msg: string): void => void errors.push(`ERROR line ${line}: ${msg}`);
const warn = (line: number, msg: string): void => void warns.push(`WARN  line ${line}: ${msg}`);
const count = (tags: string[], set: string[]): number => tags.filter((t) => set.includes(t)).length;

function checkScenario(s: Scenario): void {
  const at = s.line;
  const t = s.tags;
  const label = `"${s.title}"`;

  for (const tag of new Set(t)) {
    if (!KNOWN.has(tag) && !PATTERNS.some((p) => p.test(tag))) {
      err(at, `${label}: tag ${tag} is not in the taxonomy (new tag ideas go to open questions)`);
    }
  }

  if (count(t, PRIORITY) !== 1) err(at, `${label}: needs exactly one of @p0/@p1/@p2`);
  if (count(t, EXECUTION) !== 1) err(at, `${label}: needs exactly one of @automated/@manual`);
  if (count(t, PLATFORM) < 1) err(at, `${label}: missing platform tag (@web/@api/@mobile-web)`);
  if (!t.some((x) => x.startsWith('@feature-'))) err(at, `${label}: missing @feature-<module>`);
  if (!t.some((x) => x.startsWith('@REQ-') || x.startsWith('@JIRA-'))) {
    err(at, `${label}: missing traceability tag (@REQ-* or @JIRA-*)`);
  }
  if (count(t, TYPE) < 1) err(at, `${label}: needs at least one Type tag`);

  const derived = t.includes('@derived');
  const hasAc = t.some((x) => /^@AC-\d{2}$/.test(x));
  if (derived && hasAc) err(at, `${label}: @derived scenarios must not carry @AC-nn`);
  if (!derived && !hasAc) err(at, `${label}: missing @AC-nn (or tag @derived if no confirmed AC backs it)`);

  const manual = t.includes('@manual');
  const auto = t.includes('@automated');
  if (manual && count(t, ['@automated', ...RUNNER]) > 0) {
    err(at, `${label}: @manual must not carry @automated/@smoke/@regression/@e2e`);
  }
  if (auto && t.includes('@p0') && !t.includes('@smoke') && !t.includes('@e2e')) {
    err(at, `${label}: @automated @p0 needs @smoke (or @e2e)`);
  }
  if (auto && (t.includes('@p1') || t.includes('@p2')) && !t.includes('@regression') && !t.includes('@e2e')) {
    err(at, `${label}: @automated @p1/@p2 needs @regression (or @e2e)`);
  }

  const note = s.comments.join(' ');
  if (t.includes('@assumption') && !/assumption:/i.test(note)) {
    err(at, `${label}: @assumption needs an "Assumption: ..." comment above the test/scenario`);
  }
  if (t.includes('@blocked') && !/open question:/i.test(note)) {
    err(at, `${label}: @blocked needs an "Open question: ..." comment above the test/scenario`);
  }

  // Body text checks
  if (PLACEHOLDER.some((p) => p.test(s.bodyText))) {
    err(at, `${label}: placeholder / policy-referencing assertion detected in test body`);
  }
  if (CREDENTIAL.test(s.bodyText)) {
    warn(at, `${label}: credential-like literal in test, move to .env / data factory`);
  }
}

function normalize(x: string): string {
  return x.replace(/\\\|/g, '|').replace(/\s+/g, ' ').trim();
}

function main(): void {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: check-generated <generated/feature-dir | file.spec.ts | file.feature>');
    process.exit(2);
  }
  const isFile = fs.existsSync(arg) && fs.statSync(arg).isFile();
  const dir = isFile ? path.dirname(arg) : arg;

  let testFiles: string[] = [];
  if (isFile) {
    testFiles = [arg];
  } else if (fs.existsSync(dir)) {
    testFiles = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.spec.ts') || f.endsWith('.feature'))
      .map((f) => path.join(dir, f));
  }

  if (!testFiles.length) {
    console.error(`No .spec.ts or .feature test files found in ${arg}`);
    process.exit(2);
  }

  const matrixPath = path.join(dir, 'test-matrix.md');
  const matrix = fs.existsSync(matrixPath) ? normalize(fs.readFileSync(matrixPath, 'utf8')) : null;
  if (matrix === null) errors.push(`ERROR: ${matrixPath} not found (Phase 6 requires a matrix)`);

  const titles = new Set<string>();
  let total = 0;
  let derivedCount = 0;
  const byDisposition: Record<string, number> = {};

  for (const f of testFiles) {
    const content = fs.readFileSync(f, 'utf8');
    const p = f.endsWith('.feature') ? parseFeatureFile(content) : parseSpecFile(content);

    total += p.scenarios.length;

    for (const s of p.scenarios) {
      checkScenario(s);
      if (s.tags.includes('@derived')) derivedCount += 1;
      const disp = s.tags.includes('@blocked') ? 'blocked' : s.tags.includes('@manual') ? 'manual' : 'automated';
      byDisposition[disp] = (byDisposition[disp] ?? 0) + 1;

      // Extract raw title without trailing tags if title embedded tags
      const cleanTitle = s.title.replace(/@[a-zA-Z0-9_-]+/g, '').trim();

      if (titles.has(cleanTitle)) err(s.line, `duplicate test title "${cleanTitle}"`);
      titles.add(cleanTitle);

      if (matrix !== null) {
        const normTitle = normalize(cleanTitle);
        if (!matrix.includes(normTitle)) {
          err(s.line, `"${cleanTitle}" not found in test-matrix.md (use the exact title in the description column)`);
        }
      }
    }
  }

  if (derivedCount > DERIVED_CAP) {
    errors.push(`ERROR: ${derivedCount} @derived scenarios, cap is ${DERIVED_CAP} per feature`);
  }

  [...errors, ...warns].forEach((m) => console.log(m));
  console.log(`\nTests verified: ${total} | derived: ${derivedCount} | ${Object.entries(byDisposition).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  console.log(errors.length ? `FAILED: ${errors.length} error(s), ${warns.length} warning(s)` : `PASSED with ${warns.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}

main();
