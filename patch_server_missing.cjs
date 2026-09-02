const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('adminEmail: user.email,', 'adminEmail: memberEmail,'); // there is a bug from previous edits. I noticed earlier user.email wasn't defined correctly on the server block in the earlier prompt context.
fs.writeFileSync('server.ts', content);
