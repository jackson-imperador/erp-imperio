const fs = require('fs');
const path = require('path');

const dirs = [
  'src/shared/infrastructure/resilience',
  'src/modules/integrations/banking/domain/interfaces',
  'src/modules/integrations/banking/domain/dtos',
  'src/modules/integrations/banking/domain/enums',
  'src/modules/integrations/banking/infrastructure/providers',
  'src/modules/integrations/banking/infrastructure/factories',
  'src/modules/integrations/banking/application/commands',
  'src/modules/integrations/banking/application/queries',
  'src/modules/integrations/banking/application/handlers',
  'src/modules/integrations/banking/application/events',
  'src/modules/integrations/banking/presentation/controllers',
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

console.log('Directories created');
