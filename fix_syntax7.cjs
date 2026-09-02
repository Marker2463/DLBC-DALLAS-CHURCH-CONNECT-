const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The issue is around line 255.
content = content.replace(/<\/div>\n<\/div>\n<\/div>\n<\/div>\n<\/div>\n<div className="flex flex-col lg:flex-row gap-12">/, '</div>\n</div>\n</div>\n<div className="flex flex-col lg:flex-row gap-12">');
content = content.replace(/<\/div>\n<\/div>\n<\/div>\n<div className="flex flex-col lg:flex-row gap-12">/, '\n<div className="flex flex-col lg:flex-row gap-12">');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
