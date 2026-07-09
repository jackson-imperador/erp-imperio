const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\IMPERADOR e REI DAVI\\Desktop\\ERP IMPERIO\\backend';
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

let schema = fs.readFileSync(schemaPath, 'utf8');

// Function to add @@index([companyId]) to models that have companyId but no index
function addIndexes(schemaStr) {
  const lines = schemaStr.split('\n');
  let inModel = false;
  let modelName = '';
  let hasCompanyId = false;
  let hasIndex = false;
  let modelStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('model ')) {
      inModel = true;
      modelName = line.split(' ')[1];
      hasCompanyId = false;
      hasIndex = false;
      modelStartIndex = i;
    } else if (inModel && line.includes('companyId') && line.includes('String')) {
      hasCompanyId = true;
    } else if (inModel && line.includes('@@index([companyId])')) {
      hasIndex = true;
    } else if (inModel && line.startsWith('}')) {
      inModel = false;
      if (hasCompanyId && !hasIndex) {
        // Insert index before the closing brace
        lines.splice(i, 0, '  @@index([companyId])');
        i++; // adjust index due to insertion
      }
    }
  }
  return lines.join('\n');
}

schema = addIndexes(schema);

fs.writeFileSync(schemaPath, schema);
console.log('Database indexes added successfully.');
