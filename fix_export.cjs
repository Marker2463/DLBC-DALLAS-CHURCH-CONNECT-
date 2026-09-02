const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');
content = content.replace('export default function RequestDetail() {', 'export function MemberRequestDetail() {');
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
