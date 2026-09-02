const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/Roles.tsx', 'utf8');

// 1. Add state for deleting user
const stateImports = `
  const [isDeleting, setIsDeleting] = useState(false);
`;
content = content.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const [isSubmitting, setIsSubmitting] = useState(false);\n' + stateImports);


// 2. Add handleDeleteUser
const handleDeleteUser = `
  const handleDeleteUser = async () => {
    if (!selectedUser || !window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setIsDeleting(true);
    
    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setSelectedUser(null);
      setSearchQuery('');
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
`;
content = content.replace('const handleUpdateRole = async () => {', handleDeleteUser + '\n  const handleUpdateRole = async () => {');

// 3. Add delete button
const deleteUI = `
                  <div className="mt-2 flex justify-between items-center">
                    <button
                      onClick={handleDeleteUser}
                      disabled={isDeleting}
                      className="bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50 font-sans text-sm font-medium px-4 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      {isDeleting ? 'Deleting...' : 'Delete User'}
                    </button>
                    <button
                      onClick={handleUpdateRole}
                      disabled={!isEndorsed || !selectedRole || isSubmitting}
                      className="bg-[#1c202e] text-white font-sans text-sm font-medium px-8 py-3 rounded-lg hover:bg-[#1c202e]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Leadership Role'}
                    </button>
                  </div>
`;

content = content.replace(/<div className="mt-2 flex justify-end">[\s\S]*?<\/div>/, deleteUI);

// 4. import Trash2
content = content.replace('import { Search, Users, Shield, Baby, BookOpen, Check, AlertTriangle } from "lucide-react";', 'import { Search, Users, Shield, Baby, BookOpen, Check, AlertTriangle, Trash2 } from "lucide-react";');


// 5. fix delete doc import
content = content.replace('import { collection, getDocs, doc, updateDoc } from "firebase/firestore";', 'import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";');

fs.writeFileSync('src/pages/admin/Roles.tsx', content);
