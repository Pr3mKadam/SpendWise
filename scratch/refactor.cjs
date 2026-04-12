const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Typography cleanup
  content = content.replace(/style=\{\{\s*fontFamily:\s*'var\(--font-manrope\)'\s*\}\}/g, 'className="font-manrope"');
  content = content.replace(/style=\{\{\s*fontFamily:\s*'var\(--font-inter\)'\s*\}\}/g, 'className="font-inter"');

  // Redundant structural cleanup across various files
  // Using more targeted regex to add classNames
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Optimized:', file);
  }
});
