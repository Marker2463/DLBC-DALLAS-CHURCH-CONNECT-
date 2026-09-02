const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/<\/div>\n            <\/div>\n          \)\}\n          \{\/\* Request Journey Timeline \*\/\}/g, '</div>\n</div>\n{/* Request Journey Timeline */}');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
