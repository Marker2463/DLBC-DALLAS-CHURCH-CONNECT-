const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The issue is around line 255.
content = content.replace(/<\/button>\s*<\/div>\s*\)\}\s*\{\/\* Right Sidebar Summary Column \*\/\}/, '</button>\n</div>\n)}\n</div>\n</div>\n</div>\n)}\n{/* Right Sidebar Summary Column */}');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
