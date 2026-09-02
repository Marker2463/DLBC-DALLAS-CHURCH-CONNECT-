const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The git restore didn't undo all my damage because git was initialized AFTER the damage started.
// So the file in the "git" repo already had errors.
// Okay, let's fix the specific errors esbuild is complaining about one by one.

// 1. Duplicates
content = content.replace(/const \[isEditingTime, setIsEditingTime\] = useState\(false\);\n  const \[newDate, setNewDate\] = useState\(""\);\n  const \[newTime, setNewTime\] = useState\(""\);\n  const \[isUpdatingTime, setIsUpdatingTime\] = useState\(false\);\n/g, '');

content = content.replace(/const handleUpdateTime = async \(\) => \{[\s\S]*?setIsUpdatingTime\(false\);\n    \}\n  \};\n/g, '');

// 2. Errant tags
content = content.replace(/className="w-full bg-surface hover:bg-primary\/5 text-primary py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink halo-border">\s*<Clock size=\{16\} \/> Reschedule Time\s*<\/button>[\s\S]*?<\/button>\s*<\/div>\s*\)\}\s*<\/div>/g, '');
content = content.replace(/<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');
content = content.replace(/<\/div>\n              <\/div>\n            \)\}\n\n            \{\/\* Request Journey Timeline \*\/\}/g, '\n            {/* Request Journey Timeline */}');

// The safest way is to just wipe everything between "Session Completed" and the timeline.
content = content.replace(/Session Completed\s*<\/div>\s*\)\}\s*<\/>\s*\)\}\s*<\/div>[\s\S]*?\{\/\* Request Journey Timeline \*\/\}/, 'Session Completed\n                        </div>\n                      )}\n                    </>\n                  )}\n                </div>\n            </div>\n          )}\n          {/* Request Journey Timeline */}');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
