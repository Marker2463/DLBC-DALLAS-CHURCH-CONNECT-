const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The file has duplicate declarations and syntax errors.
// Let's strip out all the duplicate `isEditingTime` blocks and the unclosed div tags.
// Since we don't have a clean version to go back to (as the git repo was just initialized), 
// we have to manually fix it.

content = content.replace(/const \[isEditingTime, setIsEditingTime\] = useState\(false\);\n  const \[newDate, setNewDate\] = useState\(""\);\n  const \[newTime, setNewTime\] = useState\(""\);\n  const \[isUpdatingTime, setIsUpdatingTime\] = useState\(false\);\n/g, '');

content = content.replace(/const handleUpdateTime = async \(\) => \{[\s\S]*?setIsUpdatingTime\(false\);\n    \}\n  \};\n/g, '');

content = content.replace(/\{\/\* Controls \*\/\}\s*\{consultation\.status !== 'completed' && isLocked && \([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');

// Also remove the old UI chunks that are floating around
content = content.replace(/\{consultation\.status !== 'completed' && \(\s*<div className="w-full mt-4">[\s\S]*?<\/div>\s*\)\}/g, '');
content = content.replace(/\{consultation\.status !== 'completed' && !isLocked && \(\s*<div className="w-full mt-4">[\s\S]*?<\/div>\s*\)\}/g, '');
content = content.replace(/\{\/\* Controls \*\/\}\s*<div className="bg-surface rounded-xl p-6 halo-border">\s*<h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary\/10 pb-2">Session Actions<\/h3>\s*<div className="space-y-3">\s*<\/div>\s*<\/div>/g, '');

// Remove trailing tags causing errors
content = content.replace(/<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/g, '</button>\n</div>\n)}\n</div>');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
