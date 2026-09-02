const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// I will just wipe out the request timeline because that is the thing breaking the file before `Right Sidebar`.
content = content.replace(/\{\/\* Request Journey Timeline \*\/\}[\s\S]*?\{\/\* Right Sidebar Summary Column \*\/\}/, '{/* Right Sidebar Summary Column */}');
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
