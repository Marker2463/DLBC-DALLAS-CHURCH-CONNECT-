const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace(/const \[isEditingTime, setIsEditingTime\] = useState\(false\);\n  const \[newDate, setNewDate\] = useState\(""\);\n  const \[newTime, setNewTime\] = useState\(""\);\n  const \[isUpdatingTime, setIsUpdatingTime\] = useState\(false\);\n/g, '');

content = content.replace(/const handleUpdateTime = async \(\) => \{[\s\S]*?setIsUpdatingTime\(false\);\n    \}\n  \};\n/g, '');

content = content.replace(/\{\/\* Controls \*\/\}\s*\{consultation\.status !== 'completed' && isLocked && \([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');

content = content.replace(/<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
