import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users, Edit3, Loader2, Video } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useState, useEffect } from 'react';
import { db, Consultation } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import studyImg from '../../assets/images/pastoral_care_study_1787251812830.jpg';
import pewsImg from '../../assets/images/church_pews_editorial_1787251824185.jpg';

export function PastorDashboard() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Query active consultations for this pastor
    const q = query(
      collection(db, 'consultations'),
      where('leaderId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
      
      // Filter out completed ones, keep only active
      const activeDocs = docs.filter(c => c.status !== 'completed' && c.status !== 'archived');
      
      // Sort descending so most recent is first
      activeDocs.sort((a, b) => {
        const timeA = a.scheduledStart || a.selectedTime ? new Date(a.scheduledStart || a.selectedTime || '').getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.scheduledStart || b.selectedTime ? new Date(b.scheduledStart || b.selectedTime || '').getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setConsultations(activeDocs);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching consultations:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16 pb-32">
      <div className="mb-12">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-4 tracking-tight">Peace be with you, {user?.displayName || 'Pastor'}.</h1>
        <p className="font-sans text-lg text-primary/70 italic border-l-2 border-secondary/50 pl-4 py-1">
          "Feed my sheep." — John 21:17
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 items-start">
        
        {/* Active Consultations */}
        <div className="lg:col-span-2 bg-surface rounded-xl p-8 halo-border flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
            <div className="flex items-center gap-3 text-primary/80">
              <MessageSquare size={20} />
              <h2 className="font-serif text-2xl text-primary">Active Consultations</h2>
            </div>
            <div className="flex gap-4">
              <Link to="/pastor/availability" className="font-sans text-xs font-bold uppercase tracking-widest text-primary/50 hover:text-primary">[Schedule Availability]</Link>
              <Link to="/pastor/archives" className="font-sans text-xs font-bold uppercase tracking-widest text-primary/50 hover:text-primary">View Records</Link>
            </div>
          </div>
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin text-primary/30" size={32} />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="font-sans text-base text-red-500">Error loading consultations: {error}</p>
                <p className="font-sans text-xs text-primary/50 mt-2">Check console for Firestore index links if missing.</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="border border-dashed border-[#e2dcce] bg-[#faf8f3] rounded-xl p-8 text-center flex flex-col items-center justify-center">
                <p className="font-serif text-lg text-primary mb-2">No active consultations currently scheduled.</p>
                <p className="font-sans text-sm text-primary/60 max-w-sm">When congregants request guidance, upcoming sessions will appear here.</p>
              </div>
            ) : (
              consultations.map((consultation) => (
                <div key={consultation.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary/5 hover:bg-primary/[0.02] p-3 rounded-xl transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center font-sans font-medium text-primary shadow-sm shrink-0 uppercase text-sm font-semibold border border-primary/10">
                      {consultation.memberName?.substring(0, 2) || '??'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-sans text-base font-semibold text-primary">{consultation.memberName}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          consultation.urgency === 'high' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                          consultation.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200/50' :
                          'bg-surface-dim text-primary/70 border border-primary/10'
                        }`}>
                          {consultation.urgency || 'Normal'}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          consultation.status === 'scheduled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {consultation.status === 'scheduled' ? 'Confirmed' : 'Needs Finalization'}
                        </span>
                      </div>
                      <p className="font-sans text-sm text-primary/70">
                        {consultation.category} • {consultation.selectedTime ? new Date(consultation.selectedTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date pending'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {consultation.meetingMethod !== 'in_person' && consultation.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          const url = consultation.googleMeetUrl || consultation.meetingLink || 'https://meet.google.com/new';
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-sans text-xs font-semibold bg-[#1c202e] text-white hover:bg-[#1c202e]/90 transition-all shadow-sm cursor-pointer"
                        title="Launch video meeting"
                      >
                        <Video size={13} />
                        Join
                      </button>
                    )}
                    <Link
                      to={`/pastor/request/${consultation.id}`}
                      className="px-4 py-2 rounded-lg font-sans text-xs font-semibold transition-all bg-surface hover:bg-primary/5 text-primary border border-primary/10 cursor-pointer"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          
          {/* Ministry Oversight */}
          <div className="bg-surface rounded-xl p-8 halo-border">
            <div className="flex items-center gap-3 mb-6 text-primary/50">
              <Users size={20} />
              <h2 className="font-serif text-2xl text-primary">Ministry Oversight</h2>
            </div>
            
            <div className="mb-6">
              <h4 className="font-sans text-sm font-semibold text-primary mb-3">Youth Leadership Program</h4>
              <div className="w-full bg-primary/5 h-1.5 rounded-full mb-3 overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-sans text-primary/70">
                <span>12 Members Active</span>
                <span>85% Complete</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-sans text-primary/80 pt-4 border-t border-primary/5">
              <Calendar size={14} />
              <span className="font-medium">2 upcoming milestones this week</span>
            </div>
          </div>

          {/* Reflections */}
          <div className="bg-surface rounded-xl p-8 halo-border flex-grow flex flex-col">
            <div className="flex items-center gap-3 mb-6 text-primary/50">
              <Edit3 size={20} />
              <h2 className="font-serif text-2xl text-primary">Reflections</h2>
            </div>
            <textarea 
              className="w-full h-32 bg-background border border-primary/10 rounded-md p-4 font-sans text-sm text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none mb-4"
              placeholder="Personal pastoral reflections or prayer points..."
            ></textarea>
            <div className="mt-auto flex justify-end">
              <button className="font-sans text-xs font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spiritual Vitality */}
      <div>
        <h2 className="font-serif text-2xl text-primary mb-8 border-b border-primary/10 pb-4">Spiritual Vitality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sabbath Rhythm */}
          <div className="group cursor-pointer">
            <div className="aspect-[21/9] rounded-xl overflow-hidden mb-4 relative">
              <img 
                src={studyImg} 
                alt="Quiet study space" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500"></div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-primary font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Protected Time</span>
              </div>
            </div>
            <h3 className="font-serif text-xl text-primary mb-2">Sabbath Rhythm</h3>
            <p className="font-sans text-sm text-primary/70">Next scheduled rest: Friday, 8:00 AM - Saturday, 8:00 AM</p>
          </div>

          {/* Elders Retreat */}
          <div className="group cursor-pointer">
            <div className="aspect-[21/9] rounded-xl overflow-hidden mb-4 relative">
              <img 
                src={pewsImg} 
                alt="Empty church pews" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors duration-500"></div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-primary font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Upcoming</span>
              </div>
            </div>
            <h3 className="font-serif text-xl text-primary mb-2">Elders Retreat 2026</h3>
            <p className="font-sans text-sm text-primary/70">Reviewing agenda and spiritual objectives. Due in 14 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
