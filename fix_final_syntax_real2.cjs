const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/<\/div>\n              <\/div>\n            \)\}\n            \{\/\* Request Journey Timeline \*\/\}/, '</div>\n</div>\n</div>\n{/* Request Journey Timeline */}');
content = content.replace(/\{\/\* Request Journey Timeline \*\/\}/g, '{/* Request Journey Timeline */}');
content = content.replace(/<\/div>\n            \)\}\n            \{\/\* Request Journey Timeline \*\/\}/, '</div>\n</div>\n{/* Request Journey Timeline */}');


// I will just use `git checkout src/pages/member/RequestDetail.tsx` and forget about editing member detail, just checking out to HEAD. Wait, git init was called *after* it broke!
// What is the previous file contents? 

