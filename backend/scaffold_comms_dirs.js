const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src', 'modules', 'integrations', 'communications');

const dirs = [
  'presentation/controllers',
  'application/commands',
  'application/handlers',
  'domain/interfaces',
  'domain/dtos',
  'domain/models',
  'infrastructure/providers/email',
  'infrastructure/providers/sms',
  'infrastructure/providers/whatsapp',
];

for (const dir of dirs) {
  fs.mkdirSync(path.join(basePath, dir), { recursive: true });
}

console.log('Directories created.');
