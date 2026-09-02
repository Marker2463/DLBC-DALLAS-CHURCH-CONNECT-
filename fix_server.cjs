const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'const eventPayload = {',
  'const eventPayload: any = {'
);

fs.writeFileSync('server.ts', content);
