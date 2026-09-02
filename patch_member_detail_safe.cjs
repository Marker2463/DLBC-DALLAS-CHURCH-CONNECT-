const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The file is too corrupted. Let's get a clean copy from the backup.
// Oh wait, we just did a git checkout, but it was unstaged!
// Let's reset the file from the HEAD
