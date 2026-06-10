#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '..', 'src');

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
      } catch {}
    }
  } catch {}
  return files;
}

function _debug(msg) {
  process.stderr.write(msg + '\n');
}

const TAILWIND_MAP = [
  { prop: 'fontWeight: 600', tw: 'font-semibold' },
  { prop: 'fontWeight: 700', tw: 'font-bold' },
  { prop: 'fontWeight: 800', tw: 'font-extrabold' },
  { prop: "textTransform: 'uppercase'", tw: 'uppercase' },
  { prop: "letterSpacing: '0.06em'", tw: 'tracking-wide' },
  { prop: "border: 'none'", tw: 'border-0' },
  { prop: "background: 'none'", tw: 'bg-transparent' },
  { prop: "whiteSpace: 'nowrap'", tw: 'whitespace-nowrap' },
  { prop: "cursor: 'pointer'", tw: 'cursor-pointer' },
  { prop: 'opacity: 0.5', tw: 'opacity-50' },
  { prop: 'opacity: 0.3', tw: 'opacity-30' },
  { prop: 'flexShrink: 0', tw: 'shrink-0' },
  { prop: "textOverflow: 'ellipsis'", tw: 'truncate' },
  { prop: "display: 'flex'", tw: 'flex' },
  { prop: "alignItems: 'center'", tw: 'items-center' },
  { prop: "justifyContent: 'space-between'", tw: 'justify-between' },
  { prop: "justifyContent: 'center'", tw: 'justify-center' },
  { prop: "flexDirection: 'column'", tw: 'flex-col' },
  { prop: "flexDirection: 'row'", tw: 'flex-row' },
  { prop: "width: '100%'", tw: 'w-full' },
  { prop: "height: '100%'", tw: 'h-full' },
  { prop: "textAlign: 'center'", tw: 'text-center' },
  { prop: "textAlign: 'left'", tw: 'text-left' },
  { prop: "textAlign: 'right'", tw: 'text-right' },
  { prop: "overflow: 'hidden'", tw: 'overflow-hidden' },
  { prop: "objectFit: 'cover'", tw: 'object-cover' },
  { prop: "position: 'relative'", tw: 'relative' },
  { prop: "position: 'absolute'", tw: 'absolute' },
  { prop: "flexWrap: 'wrap'", tw: 'flex-wrap' },
  { prop: 'fontWeight: 800', tw: 'font-extrabold' },
  { prop: 'fontWeight: 900', tw: 'font-black' },
  { prop: "letterSpacing: '0.08em'", tw: 'tracking-widest' },
  { prop: "letterSpacing: '0.06em'", tw: 'tracking-wide' },
  { prop: "letterSpacing: '0.04em'", tw: 'tracking-wide' },
  { prop: "letterSpacing: '0.02em'", tw: 'tracking-wide' },
  { prop: "letterSpacing: '-0.02em'", tw: 'tracking-tight' },
  { prop: "overflow: 'auto'", tw: 'overflow-auto' },
  { prop: "overflow: 'visible'", tw: 'overflow-visible' },
  { prop: "objectFit: 'contain'", tw: 'object-contain' },
  { prop: "resize: 'none'", tw: 'resize-none' },
  { prop: "resize: 'vertical'", tw: 'resize-y' },
  { prop: "visibility: 'hidden'", tw: 'invisible' },
  { prop: "visibility: 'visible'", tw: 'visible' },
  { prop: "textDecoration: 'none'", tw: 'no-underline' },
  { prop: "listStyle: 'none'", tw: 'list-none' },
  { prop: "outline: 'none'", tw: 'outline-none' },
  { prop: "float: 'left'", tw: 'float-left' },
  { prop: "float: 'right'", tw: 'float-right' },
  { prop: "clear: 'both'", tw: 'clear-both' },
  { prop: "wordBreak: 'break-word'", tw: 'break-words' },
  { prop: "fontStyle: 'italic'", tw: 'italic' },
];

const PX_TO_TW = [
  { px: '0px', tw: '0' },
  { px: '1px', tw: 'px' },
  { px: '2px', tw: '0.5' },
  { px: '4px', tw: '1' },
  { px: '6px', tw: '1.5' },
  { px: '8px', tw: '2' },
  { px: '10px', tw: '2.5' },
  { px: '12px', tw: '3' },
  { px: '14px', tw: '3.5' },
  { px: '16px', tw: '4' },
  { px: '18px', tw: '4.5' },
  { px: '20px', tw: '5' },
  { px: '22px', tw: '5.5' },
  { px: '24px', tw: '6' },
  { px: '28px', tw: '7' },
  { px: '32px', tw: '8' },
  { px: '36px', tw: '9' },
  { px: '40px', tw: '10' },
  { px: '44px', tw: '11' },
  { px: '48px', tw: '12' },
  { px: '56px', tw: '14' },
  { px: '64px', tw: '16' },
  { px: '80px', tw: '20' },
  { px: '96px', tw: '24' },
  { px: '100px', tw: '24' },
  { px: '120px', tw: '30' },
  { px: '140px', tw: '35' },
  { px: '160px', tw: '40' },
  { px: '180px', tw: '45' },
  { px: '200px', tw: '50' },
];

function pxToTw(pxStr) {
  const entry = PX_TO_TW.find(e => e.px === pxStr);
  return entry ? entry.tw : null;
}

const FS_TO_TW = [
  { px: '10px', size: 'xs', weight: null },
  { px: '11px', size: 'xs' },
  { px: '12px', size: 'sm' },
  { px: '13px', size: 'sm' },
  { px: '14px', size: 'base' },
  { px: '15px', size: 'base' },
  { px: '16px', size: 'lg' },
  { px: '18px', size: 'xl' },
  { px: '20px', size: 'xl' },
  { px: '22px', size: '2xl' },
  { px: '24px', size: '2xl' },
  { px: '28px', size: '3xl' },
  { px: '32px', size: '4xl' },
  { px: '36px', size: '5xl' },
  { px: '40px', size: '6xl' },
  { px: '48px', size: '7xl' },
  { px: '56px', size: '8xl' },
  { px: '64px', size: '9xl' },
];

function fontSizeToTw(px) {
  const e = FS_TO_TW.find(x => x.px === px);
  if (e) return `text-${e.size}`;
  return null;
}

const COLOR_MAP = [
  { hex: "'#fff'", tw: 'text-white', bg: 'bg-white' },
  { hex: "'#ffffff'", tw: 'text-white', bg: 'bg-white' },
  { hex: "'#ef4444'", tw: 'text-red-500', bg: 'bg-red-500' },
  { hex: "'#dc2626'", tw: 'text-red-600', bg: 'bg-red-600' },
  { hex: "'#10b981'", tw: 'text-emerald-500', bg: 'bg-emerald-500' },
  { hex: "'#14b8a6'", tw: 'text-teal-500', bg: 'bg-teal-500' },
  { hex: "'#0d9488'", tw: 'text-teal-600', bg: 'bg-teal-600' },
  { hex: "'#f59e0b'", tw: 'text-amber-500', bg: 'bg-amber-500' },
  { hex: "'#d97706'", tw: 'text-amber-600', bg: 'bg-amber-600' },
  { hex: "'#7c3aed'", tw: 'text-violet-600', bg: 'bg-violet-600' },
  { hex: "'#818cf8'", tw: 'text-indigo-400', bg: 'bg-indigo-400' },
  { hex: "'#6366f1'", tw: 'text-indigo-500', bg: 'bg-indigo-500' },
  { hex: "'#22c55e'", tw: 'text-green-500', bg: 'bg-green-500' },
  { hex: "'#f0f2f5'", tw: 'text-gray-100', bg: 'bg-gray-100' },
  { hex: "'#edf2f7'", tw: 'text-gray-200', bg: 'bg-gray-200' },
  { hex: "'#cbd5e0'", tw: 'text-gray-300', bg: 'bg-gray-300' },
  { hex: "'#f5f7fa'", tw: 'text-gray-50', bg: 'bg-gray-50' },
  { hex: "'#1e293b'", tw: 'text-slate-800', bg: 'bg-slate-800' },
  { hex: "'#94a3b8'", tw: 'text-slate-400', bg: 'bg-slate-400' },
  { hex: "'#475569'", tw: 'text-slate-600', bg: 'bg-slate-600' },
  { hex: "'#64748b'", tw: 'text-slate-500', bg: 'bg-slate-500' },
  { hex: "'#e2e8f0'", tw: 'text-slate-200', bg: 'bg-slate-200' },
];

function convertColorToTw(prop, target) {
  const isBg = prop.startsWith('background') || prop.startsWith('backgroundColor');
  const idx = COLOR_MAP.find(c => c.hex === target);
  if (idx) return isBg ? idx.bg : idx.tw;
  return null;
}

function normalizePropValue(p) {
  let s = p.trim();
  while (s.startsWith('/*') && s.includes('*/')) {
    s = s.substring(s.indexOf('*/') + 2).trim();
  }
  return s;
}

function parseStyleLine(line) {
  const clean = normalizePropValue(line);
  const idx = clean.indexOf(':');
  if (idx === -1) return null;
  const prop = clean.substring(0, idx).trim();
  let val = clean.substring(idx + 1).trim();
  while (val.startsWith('/*') && val.includes('*/')) {
    val = val.substring(val.indexOf('*/') + 2).trim();
  }
  return { prop, val, raw: line };
}

function lineToTwClasses(line) {
  const parsed = parseStyleLine(line);
  if (!parsed) return null;
  const { prop, val } = parsed;

  const full = `${prop}: ${val}`;

  if (full.includes('var(--') || full.includes('${') || val.includes('...')) return null;

  const twEntry = TAILWIND_MAP.find(e => e.prop === full);
  if (twEntry) return [twEntry.tw];

  if (prop === 'fontSize') {
    const size = val.replace(/'/g, '');
    const cls = fontSizeToTw(size);
    if (cls) return [cls];
    return null;
  }

  if (prop === 'gap') {
    const gap = val.replace(/'/g, '');
    const tw = pxToTw(gap);
    if (tw) return [`gap-${tw}`];
    return null;
  }

  if (prop === 'marginBottom') {
    const mb = val.replace(/'/g, '');
    const tw = pxToTw(mb);
    if (tw) return [`mb-${tw}`];
    return null;
  }

  if (prop === 'marginTop') {
    const mt = val.replace(/'/g, '');
    const tw = pxToTw(mt);
    if (tw) return [`mt-${tw}`];
    return null;
  }

  if (prop === 'marginLeft') {
    const ml = val.replace(/'/g, '');
    const tw = pxToTw(ml);
    if (tw) return [`ml-${tw}`];
    return null;
  }

  if (prop === 'marginRight') {
    const mr = val.replace(/'/g, '');
    const tw = pxToTw(mr);
    if (tw) return [`mr-${tw}`];
    return null;
  }

  if (prop === 'padding') {
    const p = val.replace(/'/g, '');
    const tw = pxToTw(p);
    if (tw) return [`p-${tw}`];
    const parts = p.split(' ').filter(Boolean);
    if (parts.length === 2) {
      const y = pxToTw(parts[0]);
      const x = pxToTw(parts[1]);
      if (y && x) return [`py-${y}`, `px-${x}`];
    }
    return null;
  }

  if (prop === 'paddingTop' || prop === 'paddingBottom') {
    const dir = prop === 'paddingTop' ? 'pt' : 'pb';
    const v = val.replace(/'/g, '');
    const tw = pxToTw(v);
    if (tw) return [`${dir}-${tw}`];
    return null;
  }

  if (prop === 'paddingLeft' || prop === 'paddingRight') {
    const dir = prop === 'paddingLeft' ? 'pl' : 'pr';
    const v = val.replace(/'/g, '');
    const tw = pxToTw(v);
    if (tw) return [`${dir}-${tw}`];
    return null;
  }

  if (prop === 'borderRadius') {
    const r = val.replace(/'/g, '');
    const twMap = {
      '4px': 'rounded',
      '6px': 'rounded-md',
      '8px': 'rounded-lg',
      '10px': 'rounded-lg',
      '12px': 'rounded-xl',
      '16px': 'rounded-2xl',
      '20px': 'rounded-3xl',
      '24px': 'rounded-3xl',
      '50%': 'rounded-full',
      '999px': 'rounded-full',
    };
    if (twMap[r]) return [twMap[r]];
    return null;
  }

  if (prop === 'color' || prop === 'background' || prop === 'backgroundColor') {
    const cls = convertColorToTw(prop, val);
    if (cls) return [cls];
    return null;
  }

  if (prop === 'height' || prop === 'minHeight' || prop === 'maxHeight') {
    const v = val.replace(/'/g, '');
    if (v === '1px')
      return [prop === 'height' ? 'h-px' : prop === 'minHeight' ? 'min-h-px' : 'max-h-px'];
    if (v === '100%')
      return [prop === 'height' ? 'h-full' : prop === 'minHeight' ? 'min-h-full' : 'max-h-full'];
    const tw = pxToTw(v);
    if (tw)
      return [prop === 'height' ? `h-${tw}` : prop === 'minHeight' ? `min-h-${tw}` : `max-h-${tw}`];
    const num = parseInt(v);
    if (!isNaN(num) && v === String(num)) {
      if (num % 4 === 0)
        return [
          prop === 'height'
            ? `h-${num / 4}`
            : prop === 'minHeight'
              ? `min-h-${num / 4}`
              : `max-h-${num / 4}`,
        ];
      return [
        prop === 'height'
          ? `h-[${num}px]`
          : prop === 'minHeight'
            ? `min-h-[${num}px]`
            : `max-h-[${num}px]`,
      ];
    }
    return null;
  }

  if (prop === 'width' || prop === 'minWidth' || prop === 'maxWidth') {
    const v = val.replace(/'/g, '');
    if (v === '1px')
      return [prop === 'width' ? 'w-px' : prop === 'minWidth' ? 'min-w-px' : 'max-w-px'];
    if (v === '100%')
      return [prop === 'width' ? 'w-full' : prop === 'minWidth' ? 'min-w-full' : 'max-w-full'];
    const tw = pxToTw(v);
    if (tw)
      return [prop === 'width' ? `w-${tw}` : prop === 'minWidth' ? `min-w-${tw}` : `max-w-${tw}`];
    const num = parseInt(v);
    if (!isNaN(num) && v === String(num)) {
      if (num % 4 === 0)
        return [
          prop === 'width'
            ? `w-${num / 4}`
            : prop === 'minWidth'
              ? `min-w-${num / 4}`
              : `max-w-${num / 4}`,
        ];
      return [
        prop === 'width'
          ? `w-[${num}px]`
          : prop === 'minWidth'
            ? `min-w-[${num}px]`
            : `max-w-[${num}px]`,
      ];
    }
    return null;
  }

  if (prop === 'lineHeight') {
    const v = val.replace(/'/g, '');
    if (v === '1') return ['leading-none'];
    if (v === '1.1') return ['leading-tight'];
    if (v === '1.25') return ['leading-snug'];
    if (v === '1.375') return ['leading-normal'];
    if (v === '1.5') return ['leading-relaxed'];
    if (v === '1.625') return ['leading-loose'];
    const tw = pxToTw(v);
    if (tw) return [`leading-${tw}`];
    return null;
  }

  if (prop === 'flex') {
    if (val === '1') return ['flex-1'];
    if (val === "'1 1 160px'") return ['flex-1', 'min-w-[160px]'];
    return null;
  }

  if (prop === 'border') {
    const v = val.replace(/'/g, '');
    if (v === 'none') return ['border-0'];
    if (v === "'none'") return ['border-0'];
    return null;
  }

  if (
    prop === 'borderBottom' ||
    prop === 'borderTop' ||
    prop === 'borderLeft' ||
    prop === 'borderRight'
  ) {
    const v = val.replace(/'/g, '');
    if (v === 'none')
      return [
        `${prop === 'borderBottom' ? 'border-b' : prop === 'borderTop' ? 'border-t' : prop === 'borderLeft' ? 'border-l' : 'border-r'}-0`,
      ];
    return null;
  }

  return null;
}

function processFile(filePath) {
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    return { file: filePath, changes: 0, skipped: 0 };
  }

  let changes = 0;

  const updated = content.replace(/style=\{(\{[^}]+\})\}/g, (match, styleContent) => {
    const inner = styleContent.slice(1, -1);
    const lines = inner
      .split(/,(?=(?:[^']*'[^']*')*[^']*$)/g)
      .map(s => s.trim())
      .filter(Boolean);

    const skipMatch = match.match(/\/\* tailwind-migration:(skip|replaced) \*\//);
    if (skipMatch) return match;

    const twClasses = [];
    const remainingLines = [];

    for (const line of lines) {
      const classes = lineToTwClasses(line);
      if (classes) {
        twClasses.push(...classes);
      } else {
        remainingLines.push(line);
      }
    }

    if (twClasses.length === 0) return match;

    changes++;

    if (remainingLines.length === 0) {
      return `/* tailwind-migration:replaced */`;
    }

    const newStyle = remainingLines.join(', ');
    return `style={{ ${newStyle} }} /* tailwind-migration:skip */`;
  });

  if (changes > 0) {
    try {
      writeFileSync(filePath, updated, 'utf-8');
    } catch (e) {
      console.error(`  FAILED to write ${filePath}:`, e.message);
      return { file: filePath, changes: 0 };
    }
  }

  return { file: filePath, changes };
}

function main() {
  const files = collectTsxFiles(srcDir);
  console.log(`Found ${files.length} .tsx files`);

  let totalChanges = 0;
  const processed = [];

  for (const file of files) {
    const result = processFile(file);
    if (result.changes > 0) {
      processed.push(result);
      totalChanges += result.changes;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Files modified: ${processed.length}`);
  console.log(`  Styles replaced: ${totalChanges}`);

  if (processed.length > 0) {
    console.log('\nModified files:');
    for (const p of processed) {
      console.log(`  ${p.file} (${p.changes} replaced)`);
    }
  }
}

main();
