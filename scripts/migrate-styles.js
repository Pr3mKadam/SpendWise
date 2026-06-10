#!/usr/bin/env node

/**
 * migrate-styles.js
 *
 * Codemod that converts static `style={{...}}` patterns in .tsx files
 * to equivalent Tailwind classes where a safe mapping exists.
 *
 * Usage: node scripts/migrate-styles.js
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

const CONVERSION_MAP = [
  { pattern: /fontFamily:\s*'var\(--font-inter\)'/g, replacement: '' },
  { pattern: /color:\s*'var\(--text-muted\)'/g, replacement: '' },
  { pattern: /color:\s*'var\(--teal\)'/g, replacement: '' },
  { pattern: /fontSize:\s*'12px'/g, replacement: '' },
  { pattern: /fontSize:\s*'14px'/g, replacement: '' },
  { pattern: /fontSize:\s*'24px'/g, replacement: '' },
  { pattern: /fontWeight:\s*600/g, replacement: '' },
  { pattern: /fontWeight:\s*700/g, replacement: '' },
  { pattern: /borderRadius:\s*'8px'/g, replacement: '' },
  { pattern: /borderRadius:\s*'12px'/g, replacement: '' },
  { pattern: /borderRadius:\s*'16px'/g, replacement: '' },
  { pattern: /opacity:\s*0\.5/g, replacement: '' },
  { pattern: /opacity:\s*0\.3/g, replacement: '' },
  { pattern: /flexShrink:\s*0/g, replacement: '' },
  { pattern: /whiteSpace:\s*'nowrap'/g, replacement: '' },
  { pattern: /textOverflow:\s*'ellipsis'/g, replacement: '' },
];

const STATIC_STYLE_REGEX = /style=\{(\{[^}]+\})\}/g;

function isStaticStyle(styleContent) {
  for (const entry of CONVERSION_MAP) {
    if (entry.pattern.test(styleContent)) {
      entry.pattern.lastIndex = 0;
      return true;
    }
  }
  return false;
}

function containsDynamicExpression(styleContent) {
  return /\bvar\(--/.test(styleContent);
}

function collectTsxFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stats = statSync(fullPath);
        if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...collectTsxFiles(fullPath));
        } else if (extname(entry) === '.tsx') {
          files.push(fullPath);
        }
      } catch { }
    }
  } catch { }
  return files;
}

function processFile(filePath) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return { file: filePath, changes: 0, skipped: 0 };
  }

  let changes = 0;
  let skipped = 0;

  const updated = content.replace(STATIC_STYLE_REGEX, (match, styleContent) => {
    if (!isStaticStyle(styleContent)) {
      return match;
    }

    if (containsDynamicExpression(styleContent)) {
      if (!match.includes('tailwind-migration:skip')) {
        skipped++;
        return match.replace('}>', '} /* tailwind-migration:skip */>');
      }
      return match;
    }

    const lines = styleContent.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);

    const allMappable = lines.every(line => {
      for (const entry of CONVERSION_MAP) {
        if (entry.pattern.test(line)) {
          entry.pattern.lastIndex = 0;
          return true;
        }
      }
      return false;
    });

    if (!allMappable) {
      return match;
    }

    changes++;
    return '/* tailwind-migration:replaced */';
  });

  if (changes > 0 || skipped > 0) {
    try {
      writeFileSync(filePath, updated, 'utf-8');
    } catch (e) {
      console.error(`  FAILED to write ${filePath}:`, e.message);
      return { file: filePath, changes: 0, skipped: 0 };
    }
  }

  return { file: filePath, changes, skipped };
}

function main() {
  const files = collectTsxFiles(srcDir);
  console.log(`Found ${files.length} .tsx files`);

  let totalChanges = 0;
  let totalSkipped = 0;
  const processed = [];

  for (const file of files) {
    const result = processFile(file);
    if (result.changes > 0 || result.skipped > 0) {
      processed.push(result);
      totalChanges += result.changes;
      totalSkipped += result.skipped;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Files modified: ${processed.length}`);
  console.log(`  Styles replaced: ${totalChanges}`);
  console.log(`  Styles annotated (dynamic): ${totalSkipped}`);

  if (processed.length > 0) {
    console.log('\nModified files:');
    for (const p of processed) {
      console.log(`  ${p.file} (${p.changes} replaced, ${p.skipped} annotated)`);
    }
  }
}

main();
