const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// I am tired of this file, the build failures are due to parsing issues caused by messy regex manipulation.
// Let's rewrite the file based on its skeleton structure.
// Wait, I will just remove the whole reschedule block from this file because it wasn't here at the beginning of the previous turn!
// We can see the first error message reported:
// /app/applet/src/pages/member/RequestDetail.tsx:291:12: ERROR: Unexpected ")"
content = content.replace(/<\/div>\n<\/div>\n<\/div>\n  \);\n\}\n/g, '</div>\n</div>\n</div>\n</div>\n  );\n}\n');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
