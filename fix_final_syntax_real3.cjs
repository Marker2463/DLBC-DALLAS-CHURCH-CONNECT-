const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/<\/div>\n              <\/div>\n            \)\}\n            \{\/\* Request Journey Timeline \*\/\}/g, '</div>\n</div>\n</div>\n{/* Request Journey Timeline */}');
content = content.replace(/<\/div>\n            \)\}\n            \{\/\* Request Journey Timeline \*\/\}/g, '</div>\n</div>\n{/* Request Journey Timeline */}');

// The error says: /app/applet/src/pages/member/RequestDetail.tsx:322:11: ERROR: The character "}" is not valid inside a JSX element
content = content.replace(/<\/div>\n              <\/div>\n            \)\}/g, '</div>\n</div>\n</div>');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
