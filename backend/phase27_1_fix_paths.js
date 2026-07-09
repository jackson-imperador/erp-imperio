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
  
  // Compute exact relative path
  const relativeToSrc = path.relative(path.dirname(file), path.join(rootDir, 'infrastructure', 'database', 'prisma.service')).replace(/\\/g, '/');
  
  const newContent = content.replace(/import \{ PrismaService \} from '.*?';/, `import { PrismaService } from '${relativeToSrc}';`);
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
  }
});
console.log('Fixed PrismaService import paths.');
