const fs = require('fs');
let schema = fs.readFileSync('schema.prisma', 'utf8');

// The appended duplicate ApiKey model
schema = schema.replace(/model ApiKey \{[\s\S]*?@@map\("ent_api_keys"\)\n\}/g, '');

// The duplicate apiKeys relation in Company
schema = schema.replace(/apiKeys\s+ApiKey\[\]/g, (match, offset, fullString) => {
    // Keep the first occurrence, remove subsequent
    if (fullString.indexOf(match) === offset) {
        return match;
    }
    return '';
});

fs.writeFileSync('schema.prisma', schema);
console.log('Fixed schema.prisma');
