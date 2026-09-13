const fs = require('fs');
const path = './backend/src/modules/customer/customer.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const skip = ((query.page || 1) - 1) * (query.perPage || 10);',
  'const page = Number(query.page) || 1;\n    const perPage = Number(query.perPage) || 10;\n    const skip = (page - 1) * perPage;'
);
code = code.replace(
  'const take = query.perPage || 10;',
  'const take = perPage;'
);
fs.writeFileSync(path, code);
console.log('Controller fixed');
