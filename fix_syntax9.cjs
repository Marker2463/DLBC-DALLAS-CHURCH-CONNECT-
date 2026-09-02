const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The issue is around line 484. We probably have one too many closing tags or something.
content = content.replace(/<\/div>\n    <\/div>\n  \);\n\}\n/g, '</div>\n  );\n}\n');
content = content.replace(/<\/div>\n<\/div>\n  \);\n\}\n/g, '</div>\n  );\n}\n');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
