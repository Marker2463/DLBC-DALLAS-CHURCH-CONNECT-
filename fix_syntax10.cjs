const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/<\/div>\n    \);\n\}\n/g, '</div>\n</div>\n</div>\n  );\n}\n');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
