import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/text-\[9px\]/g, 'text-[length:var(--fs-overline)]')
    .replace(/text-\[10px\]/g, 'text-[length:var(--fs-overline)]')
    .replace(/text-\[11px\]/g, 'text-[length:var(--fs-caption)]');
  
  // Replace font-black with font-bold if the className does not contain text-2xl, text-3xl, text-4xl, text-5xl, text-6xl, text-display, text-headline
  newContent = newContent.replace(/className=(['"]|{`)(.*?)(['"]|`})/g, (match, p1, classes, p3) => {
    if (classes.includes('font-black') && !classes.match(/text-(2xl|3xl|4xl|5xl|6xl|display|headline)/)) {
      classes = classes.replace(/font-black/g, 'font-bold');
    }
    return 'className=' + p1 + classes + p3;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated typography sizes in', file);
  }
});
