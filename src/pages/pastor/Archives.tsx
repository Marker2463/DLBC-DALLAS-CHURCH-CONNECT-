import { Link } from 'react-router-dom';
import { Archive, Loader2, Search, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { db, Consultation } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function PastorArchives() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    
    // Query completed/archived consultations for this pastor
    const q = query(
      collection(db, 'consultations'),
      where('leaderId', '==', user.uid),
      where('status', 'in', ['completed', 'archived'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
      
      // Sort by selectedTime descending
      docs.sort((a, b) => {
        if (!a.selectedTime) return 1;
        if (!b.selectedTime) return -1;
        return new Date(b.selectedTime).getTime() - new Date(a.selectedTime).getTime();
      });
      setConsultations(docs);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching archived consultations:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((c) => {
      const matchesSearch = c.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [consultations, searchQuery, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(consultations.map(c => c.category));
    return Array.from(cats);
  }, [consultations]);

  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16 pb-32">
      <div className="mb-12">
        <h1 className="font-serif text-5xl text-primary mb-4 tracking-tight">Records</h1>
        <p className="font-sans text-lg text-primary/70">
          A historical record of completed consultations and pastoral care sessions.
        </p>
      </div>

      <div className="bg-surface rounded-xl p-8 halo-border flex flex-col">
        <div className="flex flex-col gap-6 mb-8 border-b border-primary/10 pb-6">
          <div className="flex items-center gap-3 text-primary/80">
            <Archive size={20} />
            <h2 className="font-serif text-2xl text-primary">Completed Records</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={14} />
              <input
                type="text"
                placeholder="Search by member name or session type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/80 border border-[#e2dcce] text-xs px-3 py-2 pl-9 rounded-lg focus:ring-1 focus:ring-[#8c2e2e] outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              {['all', 'Spiritual Guidance', 'Youth Mentorship', 'Marriage Counseling'].map((tab) => {
                const label = tab === 'all' ? 'All Records' : tab;
                const isActive = categoryFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setCategoryFilter(tab)}
                    className={`font-sans text-xs uppercase tracking-wider font-medium transition-colors hover:text-primary relative ${isActive ? 'text-primary' : 'text-primary/50'}`}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#8c2e2e]"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-primary/30" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="font-sans text-base text-red-500">Error loading archives: {error}</p>
              <p className="font-sans text-xs text-primary/50 mt-2">Check console for Firestore index links if missing.</p>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-16">
              <Archive className="mx-auto text-primary/20 mb-4" size={48} />
              <p className="font-sans text-lg text-primary/60">No matching records found.</p>
            </div>
          ) : (
            filteredConsultations.map((consultation) => (
              <Link key={consultation.id} to={`/pastor/request/${consultation.id}`} className="flex items-center gap-4 pb-6 border-b border-primary/5 hover:bg-primary/5 p-4 rounded-lg transition-colors group">
                <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center font-sans font-medium text-primary/50 shadow-sm shrink-0 uppercase">
                  {consultation.memberName?.substring(0, 2) || '??'}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-sans text-base font-semibold text-primary group-hover:text-secondary transition-colors">{consultation.memberName}</h3>
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                      {consultation.status}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-primary/70">{consultation.category} • {consultation.selectedTime ? new Date(consultation.selectedTime).toLocaleDateString() : 'No date set'}</p>
                </div>
                <ChevronRight size={20} className="text-primary/20 group-hover:text-secondary transition-colors shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
