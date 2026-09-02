const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');
content = content.replace(/<\/div>\n  \n          \{\/\* Right Sidebar Summary Column \*\/\}/g, '</div>\n</div>\n\n          {/* Right Sidebar Summary Column */}');
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
