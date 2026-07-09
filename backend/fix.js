const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/modules');

files.forEach(file => {
  const oldContent = fs.readFileSync(file, 'utf8');
  let newContent = oldContent;

  newContent = newContent.replace(/\.\.\/\.\.\/common\/guards/g, '../auth/guards');
  newContent = newContent.replace(/'SYSTEM'/g, "'SUPER_ADMIN'");
  newContent = newContent.replace(/'FINANCE_MANAGER'/g, "'MANAGER'");
  newContent = newContent.replace(/\.\.\/\.\.\/database\/prisma/g, '../../infrastructure/database/prisma');
  newContent = newContent.replace(/\.\.\/\.\.\/\.\.\/database\/prisma/g, '../../infrastructure/database/prisma');
  newContent = newContent.replace(/TransactionType/g, 'FinancialTransactionType');
  newContent = newContent.replace(/PayableStatus\.PARTIAL/g, 'PayableStatus.PARTIALLY_PAID');
  newContent = newContent.replace(/ReceivableStatus\.PARTIAL/g, 'ReceivableStatus.PARTIALLY_PAID');
  newContent = newContent.replace(/leaderId:/g, 'teamLeaderId:');

  if (file.endsWith('workflow.service.ts')) {
    if (!newContent.includes('OnEvent')) {
      newContent = newContent.replace(/import { EventEmitter2 } from '@nestjs\/event-emitter';/, "import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';");
    }
  }

  if (oldContent !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
