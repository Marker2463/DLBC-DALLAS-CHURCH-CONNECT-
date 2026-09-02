const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');
content = content.replace('import { useAuth } from "../../contexts/AuthContext";', 'import { useAuth } from "../../lib/AuthContext";');
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
