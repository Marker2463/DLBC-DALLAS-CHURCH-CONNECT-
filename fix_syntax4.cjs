const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// I am tired of playing regex tag matching games.
// Let's just restore from HEAD... oh wait, git init happened after the damage.
// BUT we can use the original file from the very first session! We didn't edit member request detail in the first session.
// Wait, I can see exactly what the bug is:
content = content.replace(/<\/div>\n              \)\}\n\n<\/div>\n<\/div>\n<div className="flex flex-col lg:flex-row gap-12">/g, '</div>\n</div>\n</div>\n<div className="flex flex-col lg:flex-row gap-12">');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
