const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The error is happening here:
// 361|          {/* Right Sidebar Summary Column */}
// Why does it expect )? Because something BEFORE it didn't close its JSX tag.

content = content.replace(/<\/div>\n          \n          \{\/\* Right Sidebar Summary Column \*\/\}/g, '</div>\n</div>\n</div>\n\n          {/* Right Sidebar Summary Column */}');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
