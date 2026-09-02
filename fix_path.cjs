const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');
content = content.replace('import { useAuth } from "../../hooks/useAuth";', 'import { useAuth } from "../../context/AuthContext";');
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
