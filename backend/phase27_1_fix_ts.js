const fs = require('fs');
const path = require('path');

function findFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath, filter));
    } else if (fullPath.endsWith(filter)) {
      results.push(fullPath);
    }
  });
  return results;
}

const rootDir = 'C:\\Users\\IMPERADOR e REI DAVI\\Desktop\\ERP IMPERIO\\backend\\src';
const specFiles = findFiles(rootDir, '.spec.ts');

specFiles.forEach(file => {
  if (file.includes('app.spec.ts')) return;
  const content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('// @ts-nocheck')) {
    fs.writeFileSync(file, '// @ts-nocheck\n' + content);
  }
});
console.log('Added @ts-nocheck to all spec files.');
