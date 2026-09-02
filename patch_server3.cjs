const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('import admin from "firebase-admin";', 
  "import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';\nimport { getFirestore } from 'firebase-admin/firestore';");

content = content.replace(/if \(!admin\.apps\.length\) {[\s\S]*?const firestore = admin\.firestore\(\);/g, 
  `if (!getApps().length) {
        initializeApp({
          projectId: "dlbc-dallas-church-connect",
          credential: applicationDefault()
        });
      }
      
      const firestore = getFirestore();`);

fs.writeFileSync('server.ts', content);
