/*
  Static UI handler audit: validates that functions referenced by onclick="..." exist
  in inline scripts or external scripts loaded by each HTML file.

  Usage:
    node tools/validate-buttons.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function exists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function listFiles(dir, exts) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) continue;
    const ext = path.extname(ent.name).toLowerCase();
    if (exts.includes(ext)) out.push(p);
  }
  return out;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function extractOnclickFunctions(html) {
  const results = [];
  const re = /\bonclick\s*=\s*(["'])([\s\S]*?)\1/gi;
  let m;
  while ((m = re.exec(html))) {
    const code = (m[2] || '').trim();
    // Common patterns: foo(...), return foo(...), foo; (rare)
    // Extract first identifier token.
    const match = code.match(/^(?:return\s+)?([A-Za-z_$][\w$]*)\s*(?:\(|;|$)/);
    if (match && match[1]) {
      results.push({ fn: match[1], code });
    }
  }
  return results;
}

function extractScriptSrcs(html) {
  const srcs = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*>\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    srcs.push(m[2]);
  }
  return srcs;
}

function extractInlineScripts(html) {
  const blocks = [];
  const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    blocks.push(m[1] || '');
  }
  return blocks;
}

function normalizeLocalScriptSrc(src) {
  // ignore absolute URLs
  if (/^(https?:)?\/\//i.test(src)) return null;
  // remove leading ./
  const clean = src.replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}

function functionExistsInSource(fn, sourceText) {
  if (!fn) return false;
  const patterns = [
    new RegExp(`\\bfunction\\s+${fn}\\b`),
    new RegExp(`\\b${fn}\\s*=\\s*function\\b`),
    new RegExp(`\\bconst\\s+${fn}\\s*=\\s*\\(`),
    new RegExp(`\\blet\\s+${fn}\\s*=\\s*\\(`),
    new RegExp(`\\bvar\\s+${fn}\\s*=\\s*\\(`),
    new RegExp(`\\bwindow\\.${fn}\\s*=`),
    new RegExp(`\\b${fn}\\s*:\\s*function\\b`)
  ];
  return patterns.some((p) => p.test(sourceText));
}

function main() {
  const htmlFiles = listFiles(ROOT, ['.html']).sort();
  const report = [];

  for (const htmlPath of htmlFiles) {
    const html = read(htmlPath);
    const onclicks = extractOnclickFunctions(html);
    const scriptSrcs = extractScriptSrcs(html)
      .map(normalizeLocalScriptSrc)
      .filter(Boolean)
      .filter(exists);
    const inlineScripts = extractInlineScripts(html);

    const sources = [];
    sources.push(...inlineScripts);
    for (const srcPath of scriptSrcs) {
      try {
        sources.push(read(srcPath));
      } catch {
        // ignore
      }
    }

    const missing = [];
    for (const item of onclicks) {
      const ok = sources.some((s) => functionExistsInSource(item.fn, s));
      if (!ok) missing.push(item);
    }

    if (missing.length) {
      report.push({
        file: path.relative(ROOT, htmlPath),
        missing
      });
    }
  }

  if (!report.length) {
    console.log('OK: No missing onclick handlers found in HTML pages.');
    process.exit(0);
  }

  console.log('Missing onclick handler functions detected:\n');
  for (const r of report) {
    console.log(`- ${r.file}`);
    const byFn = new Map();
    for (const m of r.missing) {
      if (!byFn.has(m.fn)) byFn.set(m.fn, []);
      byFn.get(m.fn).push(m.code);
    }
    for (const [fn, codes] of byFn.entries()) {
      console.log(`  - ${fn}`);
      console.log(`    example: ${codes[0]}`);
    }
    console.log('');
  }

  process.exit(2);
}

main();
