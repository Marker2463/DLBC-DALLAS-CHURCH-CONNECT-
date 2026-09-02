const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace('import { useAuth } from "../../lib/AuthContext";', 'import { useAuth } from "../../lib/AuthContext";');
// the build error earlier was: Could not resolve "../../hooks/useAuth" 
// then I fixed it, now the build should work.

