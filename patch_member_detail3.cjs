const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

content = content.replace('import { ChevronLeft, FileText, Calendar, Edit2, CheckCircle2, ShieldCheck, Loader2, Video, Lock } from "lucide-react";', 'import { ChevronLeft, FileText, Calendar, Edit2, CheckCircle2, ShieldCheck, Loader2, Video, Lock, Clock } from "lucide-react";');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
