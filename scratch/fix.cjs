const fs = require('fs');

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  let original = content;

  let count = 0;
  while(true) {
    let replaced = content.replace(/(className="[^"]*")([^>]*)className="([^"]*)"/g, (match, p1, p2, p3) => {
        let firstClass = p1.substring(11, p1.length - 1);
        let secondClass = p3;
        return `className="${firstClass} ${secondClass}"${p2}`;
    });
    if (replaced === content) break;
    content = replaced;
    count++;
  }

  if (content !== original) {
    fs.writeFileSync(path, content);
    console.log('Fixed:', path, count);
  }
}

fixFile('src/components/NavTabs.tsx');
fixFile('src/components/SharedView.tsx');
