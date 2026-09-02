import { Link } from 'react-router-dom';
import { Handshake, Calendar, ChevronRight, Video, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useState, useEffect } from 'react';
import { db, Consultation } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function Dashboard() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'consultations'),
      where('memberId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
      // Sort descending so most recent is first
      docs.sort((a, b) => {
        const timeA = a.scheduledStart || a.selectedTime ? new Date(a.scheduledStart || a.selectedTime || '').getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.scheduledStart || b.selectedTime ? new Date(b.scheduledStart || b.selectedTime || '').getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setConsultations(docs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching consultations:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-6 w-full py-12">
      {/* Greeting Section */}
      <section className="text-center mb-12">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-4 tracking-tight">
          Welcome back, {user?.displayName || 'Friend'}.
        </h1>
        <p className="font-serif text-2xl text-primary/70 italic">Peace be with you.</p>
      </section>

      {/* Daily Reflection */}
      <section className="max-w-2xl mx-auto text-center mb-16 relative py-10">
        <div className="absolute inset-0 bg-surface-dim/30 rounded-xl -z-10 halo-border"></div>
        <div className="font-serif text-4xl text-outline mb-6">"</div>
        <p className="font-sans text-lg text-primary leading-relaxed mb-6">
          "Be completely humble and gentle; be patient, bearing with one another in love. Make every effort to keep the unity of the Spirit through the bond of peace."
        </p>
        <p className="font-sans text-sm text-primary/70 uppercase tracking-widest font-medium">Ephesians 4:2-3</p>
      </section>

      {/* My Journey Bento Grid */}
      <section className="mb-24">
        <h2 className="font-serif text-3xl text-primary mb-8 border-b border-primary/10 pb-4">My Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Consultations */}
          <div className="bg-surface rounded-lg p-8 halo-border col-span-1 md:col-span-2 relative overflow-hidden group">
            <span className="inline-block px-3 py-1 bg-background rounded-full font-sans text-xs text-primary/70 mb-6 halo-border">Active Consultations</span>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin text-primary/30" size={32} />
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-sans text-base text-primary/60">You have no active consultations at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.slice(0, 3).map((consultation) => (
                  <Link key={consultation.id} to={`/member/request/${consultation.id}`} className="block bg-background border border-primary/10 rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-sans text-base font-medium text-primary">{consultation.category}</h4>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          consultation.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                          consultation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {consultation.status.replace('_', ' ')}
                      </span>
                    </div>
                    {consultation.selectedTime && (
                      <p className="font-sans text-sm text-primary/70 mb-2 flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(consultation.selectedTime).toLocaleString()}
                      </p>
                    )}
                    {consultation.googleMeetUrl && (
                      <div className="flex items-center gap-2 text-secondary font-sans text-xs mt-3">
                        <Video size={14} /> Video Room Assigned
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pastoral Connection */}
          <div className="bg-[#1c202e] rounded-lg p-8 halo-border col-span-1 flex flex-col justify-between text-white group">
            <div>
              <Handshake size={32} className="text-[#b93c3c] mb-4" />
              <h3 className="font-serif text-2xl text-white mb-2">Pastoral Connection</h3>
              <p className="font-sans text-base text-white/70 mb-8">Seek guidance or share your burdens in a confidential space.</p>
            </div>
            <Link 
              to="/member/request" 
              className="w-full py-3 px-4 border border-white/20 rounded font-sans text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              Request Consultation <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

