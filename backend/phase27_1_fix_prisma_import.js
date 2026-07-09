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

let count = 0;
specFiles.forEach(file => {
  if (file.includes('app.spec.ts')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove bad PrismaService import and add PrismaClient
  content = content.replace(/import\s+\{\s*PrismaService\s*\}\s+from\s+['"].*?['"];/g, `import { PrismaClient } from '@prisma/client';`);
  
  // Replace references
  content = content.replace(/PrismaService/g, 'PrismaClient');
  
  fs.writeFileSync(file, content);
  count++;
});
console.log(`Replaced PrismaService with PrismaClient in ${count} files.`);
