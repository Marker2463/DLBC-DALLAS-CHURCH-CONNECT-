import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db, UserProfile } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Search, Users, Baby, BookOpen, Check, Trash2 } from 'lucide-react';

export function Roles() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.email === 'markeroladipo@gmail.com' || role === 'admin';

  const [congregation, setCongregation] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [selectedRole, setSelectedRole] = useState<'youth' | 'children' | 'pastoral' | null>(null);
  const [isEndorsed, setIsEndorsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/auth/login');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      setCongregation(users);
    }, (err) => {
      console.error("Error listening to congregation users:", err);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // When a user is selected, pre-select their current role if applicable
  useEffect(() => {
    if (selectedUser) {
      if (selectedUser.leaderType) {
        setSelectedRole(selectedUser.leaderType);
      } else {
        setSelectedRole(null);
      }
      setIsEndorsed(false);
    }
  }, [selectedUser]);

  const filteredCongregation = congregation.filter(member => 
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (member.membershipId && member.membershipId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  
  const handleDeleteUser = async () => {
    if (!selectedUser || !window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setIsDeleting(true);
    
    try {
      const userDocId = selectedUser.id || selectedUser.uid;
      await deleteDoc(doc(db, 'users', userDocId));
      setCongregation(prev => prev.filter(u => (u.id || u.uid) !== userDocId));
      setSelectedUser(null);
      setSearchQuery('');
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole || !isEndorsed) return;
    
    setIsSubmitting(true);
    try {
      const newRole = selectedRole === 'pastoral' ? 'pastor' : 'leader';
      const userUid = selectedUser.uid || selectedUser.id;
      
      // Update User Document
      const userRef = doc(db, 'users', userUid);
      await updateDoc(userRef, {
        role: newRole,
        leaderType: selectedRole,
        pendingRoleApproval: false,
        roleApprovedAt: new Date().toISOString()
      });

      // Ensure leader availability is initialized
      const { setDoc, getDoc } = await import('firebase/firestore');
      const availRef = doc(db, 'availability', userUid);
      const availSnap = await getDoc(availRef);
      if (!availSnap.exists()) {
        const defaultSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
        await setDoc(availRef, {
          leaderId: userUid,
          weeklySchedule: {
            Monday: { enabled: true, slots: defaultSlots },
            Tuesday: { enabled: true, slots: defaultSlots },
            Wednesday: { enabled: true, slots: defaultSlots },
            Thursday: { enabled: true, slots: defaultSlots },
            Friday: { enabled: true, slots: defaultSlots },
            Saturday: { enabled: true, slots: ["10:00 AM", "02:00 PM"] },
            Sunday: { enabled: true, slots: ["02:00 PM", "03:30 PM", "05:00 PM"] }
          },
          blackoutDates: [],
          updatedAt: new Date().toISOString()
        });
      }

      // Write Audit Log
      await addDoc(collection(db, 'audit_logs'), {
        timestamp: new Date().toISOString(),
        action: 'ROLE_ASSIGNMENT',
        targetUserId: userUid,
        assignedRole: selectedRole,
        adminEmail: user?.email || 'admin@dlbc.org'
      });

      alert('Leadership role updated successfully.');
      setSelectedUser(null);
      setSelectedRole(null);
      setIsEndorsed(false);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update leadership role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header Bar */}
        <header className="flex flex-col gap-2">
          <p className="font-sans text-xs font-semibold text-[#1c202e]/60 uppercase tracking-[0.2em]">
            Administration / User Roles
          </p>
          <h1 className="font-serif text-4xl text-[#1c202e]">Leadership Assignments</h1>
          <p className="font-sans text-base text-[#1c202e]/70 max-w-2xl mt-2">
            Appoint stewards to guide the next generation and oversee the sanctuary. Each role carries the weight of spiritual responsibility and communal care.
          </p>
        </header>

        {/* Two-Column Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (4 Columns - Search & List) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative">
              <label className="sr-only">Search Congregation</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-[#1c202e]/40" />
              </div>
              <input
                type="text"
                placeholder="Name or Membership ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#1c202e]/10 rounded-lg font-sans text-sm text-[#1c202e] placeholder-[#1c202e]/40 focus:outline-none focus:ring-2 focus:ring-[#1c202e]/20 transition-all shadow-sm"
              />
            </div>
            
            <div className="bg-white border border-[#1c202e]/10 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
              <div className="px-4 py-3 border-b border-[#1c202e]/5 bg-gray-50/50">
                <h3 className="font-sans text-xs font-semibold text-[#1c202e]/60 uppercase tracking-wider">
                  Congregation
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredCongregation.length === 0 ? (
                  <div className="p-8 text-center text-[#1c202e]/50 font-sans text-sm">
                    No members found matching your search.
                  </div>
                ) : (
                  filteredCongregation.map((member) => (
                    <button
                      key={member.uid}
                      onClick={() => setSelectedUser(member)}
                      className={`w-full text-left flex items-center gap-4 p-3 rounded-lg transition-all ${
                        selectedUser?.uid === member.uid
                          ? 'bg-[#1c202e]/5 border border-[#1c202e]/20'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1c202e]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.photoURL ? (
                          <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-sm text-[#1c202e]">
                            {member.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif text-base text-[#1c202e] truncate">
                          {member.displayName}
                        </span>
                        <span className="font-sans text-xs text-[#1c202e]/50 truncate">
                          {member.email}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (8 Columns - Workspace) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {selectedUser ? (
              <>
                <div className="bg-white border border-[#1c202e]/10 rounded-xl p-6 shadow-sm flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-[#1c202e]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedUser.photoURL ? (
                      <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-2xl text-[#1c202e]">
                        {selectedUser.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-serif text-2xl text-[#1c202e]">
                      {selectedUser.displayName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="font-sans text-sm text-[#1c202e]/60">
                        ID: {selectedUser.membershipId || `DLBC-${selectedUser.uid.substring(0, 6).toUpperCase()}`}
                      </span>
                      <span className="text-[#1c202e]/30">•</span>
                      <span className="font-sans text-sm text-[#1c202e]/60">
                        Member Since: {selectedUser.memberSince ? new Date(selectedUser.memberSince).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="text-[#1c202e]/30">•</span>
                      <span className="font-sans text-sm text-[#1c202e]/60 capitalize">
                        Current Role: <strong className="text-[#1c202e] font-semibold">{selectedUser.role}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#1c202e]/10 rounded-xl shadow-sm p-6 flex flex-col gap-6">
                  <h3 className="font-sans text-sm font-semibold text-[#1c202e]/60 uppercase tracking-wider mb-2">
                    Stewardship Designation
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Youth Leader Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('youth')}
                      className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all ${
                        selectedRole === 'youth'
                          ? 'border-[#b93c3c] bg-white shadow-md ring-1 ring-[#b93c3c]'
                          : 'border-[#1c202e]/10 bg-gray-50/30 hover:border-[#1c202e]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className={`p-2 rounded-lg ${selectedRole === 'youth' ? 'bg-[#b93c3c]/10 text-[#b93c3c]' : 'bg-[#1c202e]/5 text-[#1c202e]/70'}`}>
                          <Users size={24} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === 'youth' ? 'border-[#b93c3c] bg-[#b93c3c]' : 'border-[#1c202e]/20'}`}>
                          {selectedRole === 'youth' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <h4 className="font-serif text-lg text-[#1c202e] mb-2">Youth Leader</h4>
                      <p className="font-sans text-xs text-[#1c202e]/60 leading-relaxed">
                        Guide the youth in their spiritual growth, organizing weekly fellowships and mentorship sessions that bridge the gap between ancient wisdom and modern living.
                      </p>
                    </button>

                    {/* Children Leader Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('children')}
                      className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all ${
                        selectedRole === 'children'
                          ? 'border-[#b93c3c] bg-white shadow-md ring-1 ring-[#b93c3c]'
                          : 'border-[#1c202e]/10 bg-gray-50/30 hover:border-[#1c202e]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className={`p-2 rounded-lg ${selectedRole === 'children' ? 'bg-[#b93c3c]/10 text-[#b93c3c]' : 'bg-[#1c202e]/5 text-[#1c202e]/70'}`}>
                          <Baby size={24} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === 'children' ? 'border-[#b93c3c] bg-[#b93c3c]' : 'border-[#1c202e]/20'}`}>
                          {selectedRole === 'children' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <h4 className="font-serif text-lg text-[#1c202e] mb-2">Children Leader</h4>
                      <p className="font-sans text-xs text-[#1c202e]/60 leading-relaxed">
                        Steward the little ones in the sanctuary, fostering an environment of joy and discovery through Bible stories, creative arts, and foundational teachings.
                      </p>
                    </button>

                    {/* Pastor Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('pastoral')}
                      className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all ${
                        selectedRole === 'pastoral'
                          ? 'border-[#b93c3c] bg-white shadow-md ring-1 ring-[#b93c3c]'
                          : 'border-[#1c202e]/10 bg-gray-50/30 hover:border-[#1c202e]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className={`p-2 rounded-lg ${selectedRole === 'pastoral' ? 'bg-[#b93c3c]/10 text-[#b93c3c]' : 'bg-[#1c202e]/5 text-[#1c202e]/70'}`}>
                          <BookOpen size={24} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === 'pastoral' ? 'border-[#b93c3c] bg-[#b93c3c]' : 'border-[#1c202e]/20'}`}>
                          {selectedRole === 'pastoral' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <h4 className="font-serif text-lg text-[#1c202e] mb-2">Pastor</h4>
                      <p className="font-sans text-xs text-[#1c202e]/60 leading-relaxed">
                        Shepherd the congregation with authority and humility. Oversee administration, counsel members, and lead the liturgy with reverence and technical precision.
                      </p>
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-6 border-t border-[#1c202e]/10">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isEndorsed}
                          onChange={(e) => setIsEndorsed(e.target.checked)}
                        />
                        <div className="w-5 h-5 rounded border border-[#1c202e]/30 bg-white peer-checked:bg-[#1c202e] peer-checked:border-[#1c202e] transition-colors flex items-center justify-center group-hover:border-[#1c202e]/50">
                          <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="font-sans text-sm text-[#1c202e]/80 leading-relaxed">
                        I confirm that this leadership appointment has been reviewed and approved by the Council of Elders in accordance with the Church Constitution.
                      </span>
                    </label>
                  </div>
                  
                  
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

                </div>
              </>
            ) : (
              <div className="bg-white border border-[#1c202e]/10 rounded-xl shadow-sm p-12 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-16 h-16 bg-[#1c202e]/5 rounded-full flex items-center justify-center mb-6">
                  <Users size={28} className="text-[#1c202e]/40" />
                </div>
                <h3 className="font-serif text-2xl text-[#1c202e] mb-2">Select a Member</h3>
                <p className="font-sans text-base text-[#1c202e]/60 max-w-md">
                  Choose a member from the congregation list to view their current status and assign new stewardship responsibilities.
                </p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
