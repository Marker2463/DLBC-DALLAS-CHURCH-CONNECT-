import { useState, useEffect } from 'react';
import { 
  Lock, 
  Video, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  User, 
  Loader2, 
  BookOpen,
  HeartHandshake,
  MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db, Consultation } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getOrInitializeMeetUrl } from '../../lib/appointmentService';

export function MemberSanctuary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoinSession = async (session: Consultation) => {
    if (session.meetingMethod === 'in_person') return;
    const existingUrl = session.meetUrl || session.googleMeetUrl || session.meetingLink;
    if (existingUrl) {
      window.open(existingUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      setJoiningId(session.id);
      const url = await getOrInitializeMeetUrl(session.id, {
        summary: `DLBC Consultation — ${session.category || 'Pastoral Care'}`,
        startIso: session.scheduledStart || session.selectedTime || undefined,
        method: session.meetingMethod
      });
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error("Failed to initialize session meeting URL:", err);
      window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
    } finally {
      setJoiningId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'consultations'),
      where('memberId', '==', user.uid)
    );
    const unsub = onSnapshot(
      q, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation));
        // Sort descending so the most recent appointment is at the top
        docs.sort((a, b) => {
          const timeA = a.scheduledStart || a.selectedTime ? new Date(a.scheduledStart || a.selectedTime || '').getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.scheduledStart || b.selectedTime ? new Date(b.scheduledStart || b.selectedTime || '').getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setSessions(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching member sessions:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Find the active scheduled consultation (most recent scheduled session)
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'under_review' || s.status === 'submitted');
  const activeSession = scheduledSessions.length > 0 ? scheduledSessions[0] : (upcomingSessions.length > 0 ? upcomingSessions[0] : null);

  const formatScheduledTime = (isoString?: string | null) => {
    if (!isoString) return 'Time Pending';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeStatusBadge = (isoString?: string | null) => {
    if (!isoString) return null;
    const sessionTime = new Date(isoString).getTime();
    const now = Date.now();
    const diffMins = Math.round((sessionTime - now) / 60000);

    if (diffMins > 0 && diffMins <= 30) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b93c3c]/20 border border-[#b93c3c]/30 text-[#ffb3ae] font-sans text-xs font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb3ae]"></span>
          STARTS IN {diffMins} MINS
        </span>
      );
    } else if (diffMins <= 0 && diffMins >= -60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-sans text-xs font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          MEETING ACTIVE NOW
        </span>
      );
    } else if (diffMins > 0 && diffMins <= 1440) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-200 font-sans text-xs font-bold uppercase tracking-widest">
          <Clock size={12} />
          SCHEDULED TODAY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 font-sans text-xs font-bold uppercase tracking-widest">
        <Calendar size={12} />
        CONFIRMED APPOINTMENT
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-40">
      <div className="max-w-6xl mx-auto px-6 w-full pt-16">
        
        {/* Breadcrumbs */}
        <div className="mb-6 font-sans text-xs font-bold uppercase tracking-widest text-primary/50 flex items-center justify-between">
          <span>MEMBER PORTAL &gt; CONSULTATIONS</span>
          <Link 
            to="/member/request" 
            className="text-primary/70 hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1"
          >
            + Request New Consultation
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-3 tracking-tight">
            Consultations
          </h1>
        </div>

        {/* Active Meeting Feature Portal Card */}
        {loading ? (
          <div className="bg-[#1c202e] rounded-2xl p-12 mb-12 flex items-center justify-center text-white/50 shadow-lg">
            <Loader2 className="animate-spin mr-3" size={24} /> Loading your consultations...
          </div>
        ) : activeSession ? (
          <div className="bg-[#1c202e] rounded-2xl p-8 md:p-10 mb-12 shadow-2xl relative overflow-hidden border border-white/10 text-white">
            
            {/* Ambient Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#b93c3c]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
                  {activeSession.meetingMethod === 'in_person' ? (
                    <MapPin size={28} className="text-white/90" />
                  ) : (
                    <Video size={28} className="text-white/90" />
                  )}
                </div>
                
                <div>
                  <div className="mb-3">
                    {getTimeStatusBadge(activeSession.selectedTime)}
                  </div>
                  
                  <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">
                    {activeSession.category || 'Pastoral Care Consultation'}
                  </h2>
                  
                  <p className="font-sans text-sm md:text-base text-white/80 leading-relaxed max-w-xl">
                    Private consultation with <strong className="text-white font-semibold">{activeSession.leaderName || 'Your Assigned Pastor'}</strong>.
                  </p>
                  
                  {activeSession.selectedTime && (
                    <p className="font-sans text-xs text-white/60 mt-1 flex items-center gap-1.5">
                      <Clock size={13} className="text-[#ffb3ae]" />
                      {formatScheduledTime(activeSession.selectedTime)}
                      {activeSession.meetingMethod === 'in_person' && (
                        <> • Location: {activeSession.meetingLocation || 'On-Campus Sanctuary / Office'}</>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Suite */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {activeSession.meetingMethod !== 'in_person' && (
                  <button
                    onClick={() => handleJoinSession(activeSession)}
                    disabled={joiningId === activeSession.id}
                    className="inline-flex items-center gap-2 bg-white text-[#1c202e] hover:bg-white/90 font-sans text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-75"
                  >
                    {joiningId === activeSession.id ? (
                      <Loader2 size={16} className="animate-spin text-[#b93c3c]" />
                    ) : (
                      <Video size={16} className="text-[#b93c3c]" />
                    )}
                    {joiningId === activeSession.id ? 'Connecting Room...' : 'Join Video Room'}
                  </button>
                )}

                <Link
                  to={`/member/request/${activeSession.id}`}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold uppercase tracking-wider px-4 py-3.5 rounded-lg transition-colors border border-white/20 cursor-pointer"
                >
                  <FileText size={15} />
                  Open Case Record
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 md:p-10 mb-12 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-primary/10 flex items-center justify-center text-primary/60 shrink-0">
                <HeartHandshake size={26} className="text-[#b93c3c]" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-primary mb-1">No Scheduled Consultations</h3>
                <p className="font-sans text-sm text-primary/70 max-w-md">
                  You currently do not have an active consultation. When your pastoral appointment is scheduled, session details will appear here.
                </p>
              </div>
            </div>
            <Link
              to="/member/request"
              className="px-6 py-3.5 bg-[#1c202e] text-white rounded-xl font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#1c202e]/90 transition-colors shadow-md shrink-0 flex items-center gap-2"
            >
              Book A Session <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Member Consultations Ledger */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-primary">
                Your Consultations &amp; Appointments Ledger
              </h3>
              <p className="font-sans text-xs text-primary/60 mt-0.5">
                {sessions.length} total
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10 bg-[#faf8f5]">
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Date &amp; Time</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Counselor / Leader</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Session Category</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Format</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-primary/50">
                        <Loader2 className="animate-spin mx-auto mb-2 text-primary/30" size={24} />
                        Loading appointments...
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-primary/50 italic">
                        No appointments found. Click "Request New Consultation" to schedule with a pastor.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => {
                      const meetLink = session.googleMeetUrl || session.meetingLink;
                      const isInPerson = session.meetingMethod === 'in_person';
                      return (
                        <tr 
                          key={session.id} 
                          className="hover:bg-primary/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 text-primary whitespace-nowrap">
                            <div className="font-medium">
                              {session.selectedTime ? new Date(session.selectedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date Pending'}
                            </div>
                            <div className="text-xs text-primary/60">
                              {session.selectedTime ? new Date(session.selectedTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Awaiting Review'}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1c202e]/10 text-primary font-serif flex items-center justify-center text-sm">
                                {session.leaderName ? session.leaderName.charAt(0).toUpperCase() : <User size={14} />}
                              </div>
                              <span className="text-primary font-medium">
                                {session.leaderName || 'Pastoral Office'}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-primary whitespace-nowrap font-medium">
                            {session.category}
                          </td>

                          <td className="px-6 py-4 text-primary/80 whitespace-nowrap text-xs font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#faf8f5] border border-primary/10">
                              {isInPerson ? (
                                <>
                                  <MapPin size={12} className="text-[#b93c3c]" />
                                  In-Person
                                </>
                              ) : (
                                <>
                                  <Video size={12} className="text-primary/60" />
                                  {session.meetingMethod ? session.meetingMethod.replace('_', ' ') : 'Google Meet'}
                                </>
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              session.status === 'scheduled' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : session.status === 'completed' || session.status === 'archived'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {session.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {!isInPerson && session.status === 'scheduled' && (
                                <button
                                  onClick={() => handleJoinSession(session)}
                                  disabled={joiningId === session.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1c202e] text-white text-xs font-semibold rounded hover:bg-[#1c202e]/90 transition-colors shadow-sm cursor-pointer disabled:opacity-75"
                                  title="Join video consultation"
                                >
                                  {joiningId === session.id ? (
                                    <Loader2 size={13} className="animate-spin" />
                                  ) : (
                                    <Video size={13} />
                                  )}
                                  Join
                                </button>
                              )}
                              <Link
                                to={`/member/request/${session.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#faf8f5] hover:bg-primary/5 text-primary text-xs font-semibold rounded border border-primary/15 transition-colors"
                              >
                                Details
                                <ArrowRight size={12} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pre-Consultation Preparation Guide */}
        <div className="mb-16">
          <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-primary mb-6">
            Consultation Preparation Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#b93c3c]">
                <Lock size={20} />
              </div>
              <h4 className="font-serif text-lg text-primary">Private Location</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                Choose a quiet, undisturbed room to ensure your conversation remains peaceful and completely confidential.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#b93c3c]">
                <BookOpen size={20} />
              </div>
              <h4 className="font-serif text-lg text-primary">Bible &amp; Notebook</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                Keep your Bible and a notepad ready for scriptural guidance, prayer directives, and pastoral insights.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#faf8f5] flex items-center justify-center text-[#b93c3c]">
                <HeartHandshake size={20} />
              </div>
              <h4 className="font-serif text-lg text-primary">Prayer &amp; Peace</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                Enter your consultation with an open heart. Our pastoral counselors are committed to walking with you in faith.
              </p>
            </div>
          </div>
        </div>

        {/* Trust & Privacy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-8 border border-primary/10 flex flex-col gap-3 shadow-sm">
            <Lock className="text-[#b93c3c] mb-1" size={24} />
            <h4 className="font-serif text-xl text-primary">Confidential Counsel</h4>
            <p className="font-sans text-sm text-primary/70 leading-relaxed">
              All appointments and spiritual counsel remain strictly protected under pastoral non-disclosure.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-primary/10 flex flex-col gap-3 shadow-sm">
            <Lock className="text-[#b93c3c] mb-1" size={24} />
            <h4 className="font-serif text-xl text-primary">Immutable Privacy</h4>
            <p className="font-sans text-sm text-primary/70 leading-relaxed">
              Session records and reflection notes are restricted to your secure account and your assigned spiritual counselor.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 border border-primary/10 flex flex-col gap-3 shadow-sm">
            <HeartHandshake className="text-[#b93c3c] mb-1" size={24} />
            <h4 className="font-serif text-xl text-primary">Pastoral Covenant</h4>
            <p className="font-sans text-sm text-primary/70 leading-relaxed">
              Every counselor on this platform adheres to biblical standards of pastoral confidentiality and care.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}



