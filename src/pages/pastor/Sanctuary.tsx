import { useState, useEffect } from 'react';
import { Lock, Video, Calendar, Clock, ArrowRight, ExternalLink, FileText, CheckCircle2, User, Loader2, RefreshCw, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { db, Consultation } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getOrInitializeMeetUrl } from '../../lib/appointmentService';

export function PastorSanctuary() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'review' | 'completed'>('all');
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

    // Query consultations assigned to this pastor/leader
    const q = query(
      collection(db, 'consultations'),
      where('leaderId', '==', user.uid)
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
        console.error("Error fetching pastor sessions:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  // Find the active scheduled session (most recent scheduled session)
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'under_review' || s.status === 'submitted');
  const activeSession = scheduledSessions.length > 0 ? scheduledSessions[0] : (upcomingSessions.length > 0 ? upcomingSessions[0] : null);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'scheduled') return s.status === 'scheduled';
    if (filter === 'review') return s.status === 'under_review' || s.status === 'submitted';
    if (filter === 'completed') return s.status === 'completed' || s.status === 'archived';
    return true;
  });

  const formatScheduledTime = (isoString?: string | null) => {
    if (!isoString) return 'Time Pending';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b93c3c]/20 border border-[#b93c3c]/30 text-[#ffb3ae] font-sans text-xs font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffb3ae]"></span>
          STARTS IN {diffMins} MINS
        </span>
      );
    } else if (diffMins <= 0 && diffMins >= -60) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-sans text-xs font-bold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          SESSION ACTIVE NOW
        </span>
      );
    } else if (diffMins > 0 && diffMins <= 1440) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-200 font-sans text-xs font-bold uppercase tracking-widest">
          <Clock size={12} />
          SCHEDULED TODAY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 font-sans text-xs font-bold uppercase tracking-widest">
        <Calendar size={12} />
        UPCOMING
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-40">
      <div className="max-w-6xl mx-auto px-6 w-full pt-16">
        
        {/* Breadcrumbs */}
        <div className="mb-6 font-sans text-xs font-bold uppercase tracking-widest text-primary/50 flex items-center justify-between">
          <span>PASTORAL WORKSPACE &gt; CONSULTATIONS</span>
          <div className="flex items-center gap-3">
            <Link 
              to="/pastor/availability" 
              className="text-primary/70 hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Calendar size={13} />
              Manage Availability
            </Link>
            <span className="text-primary/30">•</span>
            <Link 
              to="/pastor/archives" 
              className="text-primary/70 hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <FileText size={13} />
              Records
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-primary mb-3 tracking-tight">
            Consultations
          </h1>
        </div>

        {/* Active / Next Scheduled Meeting Feature Banner */}
        {loading ? (
          <div className="bg-[#1c202e] rounded-xl p-12 mb-12 flex items-center justify-center text-white/50">
            <Loader2 className="animate-spin mr-3" size={24} /> Loading consultations...
          </div>
        ) : activeSession ? (
          <div className="bg-[#1c202e] rounded-xl p-8 md:p-10 mb-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-white/10">
            <div className="flex items-start md:items-center gap-6 z-10">
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
                  {activeSession.category || 'Spiritual Counseling Session'}
                </h2>
                <p className="font-sans text-sm text-white/80 leading-relaxed max-w-xl">
                  Private pastoral consultation with <strong className="text-white font-medium">{activeSession.memberName || 'Congregation Member'}</strong>.
                  {activeSession.selectedTime && (
                    <span className="block mt-1 text-white/60">
                      Scheduled for {formatScheduledTime(activeSession.selectedTime)}
                      {activeSession.meetingMethod === 'in_person' && (
                        <> • Location: {activeSession.meetingLocation || 'On-Campus Sanctuary / Office'}</>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="z-10 flex flex-wrap items-center gap-4 shrink-0">
              {activeSession.meetingMethod !== 'in_person' && (
                <button
                  onClick={() => handleJoinSession(activeSession)}
                  disabled={joiningId === activeSession.id}
                  className="inline-flex items-center gap-2.5 bg-white text-[#1c202e] font-sans text-sm font-semibold px-6 py-3.5 rounded-lg hover:bg-white/90 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-75"
                >
                  {joiningId === activeSession.id ? (
                    <Loader2 size={18} className="animate-spin text-[#b93c3c]" />
                  ) : (
                    <Video size={18} className="text-[#b93c3c]" />
                  )}
                  {joiningId === activeSession.id ? 'Connecting Room...' : 'Join Video Room'}
                </button>
              )}

              <Link
                to={`/pastor/request/${activeSession.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-sans text-sm font-medium px-5 py-3.5 rounded-lg transition-colors border border-white/20"
              >
                <FileText size={16} />
                Open Case Record
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 mb-12 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#faf8f5] border border-primary/10 flex items-center justify-center text-primary/60 shrink-0">
                <CheckCircle2 size={24} className="text-primary/70" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-primary mb-1">No Active Consultations Pending</h3>
                <p className="font-sans text-sm text-primary/60">All assigned consultations are up to date or awaiting member scheduling.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/pastor/availability"
                className="px-5 py-2.5 bg-[#1c202e] text-white rounded-lg font-sans text-xs font-semibold uppercase tracking-wider hover:bg-[#1c202e]/90 transition-colors shadow-sm"
              >
                Update Calendar Slots
              </Link>
            </div>
          </div>
        )}

        {/* Assigned Sessions Ledger */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-primary">
                Assigned Consultations &amp; Session Roster
              </h3>
              <p className="font-sans text-xs text-primary/60 mt-0.5">
                {sessions.length} total
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Cases' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'review', label: 'Pending Review' },
                { key: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-full font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    filter === tab.key
                      ? 'bg-[#1c202e] text-white'
                      : 'bg-white border border-primary/10 text-primary/70 hover:bg-surface-dim'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead>
                  <tr className="border-b border-primary/10 bg-[#faf8f5]">
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Date &amp; Time</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Session Category</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Format</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-primary/70 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-primary/50">
                        <Loader2 className="animate-spin mx-auto mb-2 text-primary/30" size={24} />
                        Loading assigned consultations...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-primary/50 italic">
                        {filter === 'all' 
                          ? 'No pastoral consultations have been assigned to your workspace yet.' 
                          : `No consultations found under "${filter}" status.`}
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => {
                      const meetLink = session.googleMeetUrl || session.meetingLink || (session.meetingMethod !== 'in_person' ? 'https://meet.google.com/new' : '');
                      const isInPerson = session.meetingMethod === 'in_person';
                      return (
                        <tr 
                          key={session.id} 
                          className="hover:bg-primary/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 text-primary whitespace-nowrap">
                            <div className="font-medium">
                              {session.selectedTime ? new Date(session.selectedTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Date'}
                            </div>
                            <div className="text-xs text-primary/60">
                              {session.selectedTime ? new Date(session.selectedTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Unscheduled'}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#1c202e]/10 text-primary font-serif flex items-center justify-center text-sm">
                                {session.memberName ? session.memberName.charAt(0).toUpperCase() : <User size={14} />}
                              </div>
                              <span className="text-primary font-medium">
                                {session.memberName || 'Congregation Member'}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-primary whitespace-nowrap">
                            <span className="font-medium">{session.category}</span>
                            {session.urgency === 'high' && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                                Urgent
                              </span>
                            )}
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
                                  title="Launch video meeting"
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
                                to={`/pastor/request/${session.id}`}
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

        {/* Pastoral Support & Covenant Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
            <div>
              <Lock className="text-[#b93c3c] mb-3" size={22} />
              <h4 className="font-serif text-lg text-primary mb-1">Encrypted Confidentiality</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                All consultation notes and pastoral reflections remain strictly confidential between you and the member.
              </p>
            </div>
            <Link to="/ministry-guidelines" className="mt-4 text-xs font-bold uppercase tracking-wider text-primary/60 hover:text-primary flex items-center gap-1">
              Read Guidelines <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
            <div>
              <Calendar className="text-[#b93c3c] mb-3" size={22} />
              <h4 className="font-serif text-lg text-primary mb-1">Calendar Integration</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                Sessions sync directly with your Google Calendar with automatic meeting link generation and reminders.
              </p>
            </div>
            <Link to="/pastor/availability" className="mt-4 text-xs font-bold uppercase tracking-wider text-primary/60 hover:text-primary flex items-center gap-1">
              Update Timeslots <ArrowRight size={12} />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
            <div>
              <FileText className="text-[#b93c3c] mb-3" size={22} />
              <h4 className="font-serif text-lg text-primary mb-1">Pastoral Case Notes</h4>
              <p className="font-sans text-xs text-primary/70 leading-relaxed">
                Record spiritual notes, scriptural passages, and prayer points securely during or after each consultation.
              </p>
            </div>
            <Link to="/pastor/archives" className="mt-4 text-xs font-bold uppercase tracking-wider text-primary/60 hover:text-primary flex items-center gap-1">
              View Records <ArrowRight size={12} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

