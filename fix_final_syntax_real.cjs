const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/<\/div>\n              <\/div>\n            \)\}/, '</div>\n</div>');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
