const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// Is there a regex in the document? There shouldn't be. 
// "Unterminated regular expression" might mean we lost a quote or slash in our replacements.
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}/g, '</div>\n</div>\n</div>\n  );\n}\n');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
