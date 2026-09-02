const fs = require('fs');

// We have 415 lines originally but with all the duplicates we have more.
// Let's just create a completely fresh clean version.
const content = `import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { ChevronLeft, FileText, Calendar, Edit2, CheckCircle2, ShieldCheck, Loader2, Video, Lock, Clock, Send } from "lucide-react";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [reasonDraft, setReasonDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);

  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  const [joinState, setJoinState] = useState<'upcoming' | 'ready' | 'ended'>('upcoming');
  const [timeToMeeting, setTimeToMeeting] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, 'consultations', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setConsultation(data);
          setReasonDraft(data.reason || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, \`consultations/\${id}/notes\`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!consultation || consultation.status !== 'scheduled' || !consultation.scheduledStart) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(consultation.scheduledStart);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Assuming 1 hour meetings

      const diff = start.getTime() - now.getTime();
      
      if (now > end) {
        setJoinState('ended');
        setTimeToMeeting('');
      } else if (diff <= 5 * 60 * 1000) { 
        setJoinState('ready');
        setTimeToMeeting('');
      } else {
        setJoinState('upcoming');
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        
        if (days > 0) setTimeToMeeting(\`in \${days}d \${hours}h\`);
        else if (hours > 0) setTimeToMeeting(\`in \${hours}h \${minutes}m\`);
        else setTimeToMeeting(\`in \${minutes}m\`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [consultation]);

  const handleUpdateTime = async () => {
    if (!consultation || !id || !newDate || !newTime) return;
    setIsUpdatingTime(true);
    
    try {
      const selectedTime = new Date(\`\${newDate}T\${newTime}:00\`).toISOString();
      
      if (consultation.googleEventId) {
        await fetch('/api/calendar/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: consultation.googleEventId,
            selectedTime
          })
        });
      }

      await updateDoc(doc(db, 'consultations', id), {
        scheduledStart: selectedTime,
        selectedTime: selectedTime,
        journeyTimeline: [
          ...(consultation.journeyTimeline || []),
          { status: 'Rescheduled', timestamp: new Date().toISOString(), description: \`Meeting rescheduled to \${new Date(selectedTime).toLocaleString()} by member.\` }
        ]
      });

      setConsultation({...consultation, scheduledStart: selectedTime, selectedTime: selectedTime});
      setIsEditingTime(false);
    } catch (err) {
      console.error("Failed to update time", err);
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const handleSaveReason = async () => {
    if (!consultation || !id) return;
    try {
      await updateDoc(doc(db, 'consultations', id), {
        reason: reasonDraft,
        updatedAt: new Date().toISOString()
      });
      setConsultation({ ...consultation, reason: reasonDraft });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !id || !user) return;
    try {
      await addDoc(collection(db, \`consultations/\${id}/notes\`), {
        content: newNote.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Member',
        authorRole: 'member',
        createdAt: new Date().toISOString()
      });
      setNewNote("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalSubmit = async () => {
    if (!consultation || !id || !user) return;
    setIsSubmitting(true);
    
    try {
      let googleMeetUrl = null;
      let googleEventId = null;

      if (consultation.meetingMethod === 'google_meet' || consultation.meetingMethod === 'in_person') {
        const response = await fetch('/api/calendar/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId: id,
            title: \`Pastoral Consultation — \${consultation.category}\`,
            memberEmail: user.email,
            leaderEmail: consultation.leaderEmail,
            selectedTime: consultation.selectedTime || consultation.scheduledStart,
            method: consultation.meetingMethod
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.googleMeetUrl) googleMeetUrl = data.googleMeetUrl;
          if (data.eventId) googleEventId = data.eventId;
        }
      }

      const timeline = [...(consultation.journeyTimeline || [])];
      timeline.push({
        status: 'Meeting Scheduled',
        timestamp: new Date().toISOString(),
        description: 'Your meeting is scheduled. Calendar invites and reminders have been sent.'
      });

      await updateDoc(doc(db, 'consultations', id), {
        status: 'scheduled',
        isLocked: true,
        googleMeetUrl,
        googleEventId,
        meetingLink: googleMeetUrl,
        journeyTimeline: timeline
      });

      navigate('/member/sanctuary');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-primary/50" size={32} />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck className="text-primary/20 mb-4" size={64} />
        <h2 className="text-xl font-serif text-primary mb-2">Record Not Found</h2>
        <p className="text-primary/60 font-sans max-w-md">The consultation request you are looking for may have been archived or does not exist.</p>
        <button onClick={() => navigate('/member/sanctuary')} className="mt-6 text-[#b93c3c] font-medium hover:underline flex items-center gap-2">
          <ChevronLeft size={16} /> Return to Sanctuary
        </button>
      </div>
    );
  }

  const isLocked = consultation.isLocked || consultation.status !== 'draft';

  const renderTimelineNode = (title: string, currentStatus: string, desc: string, isPast: boolean, isActive: boolean) => (
    <div className="relative pl-6">
      <div className={\`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full \${isActive ? 'bg-[#b93c3c] shadow-[0_0_10px_rgba(185,60,60,0.5)]' : isPast ? 'bg-primary' : 'bg-primary/20'}\`} />
      <h4 className={\`font-sans text-sm font-semibold \${isActive ? 'text-[#b93c3c]' : isPast ? 'text-primary' : 'text-primary/40'}\`}>{title}</h4>
      <p className="font-sans text-xs text-primary/60 mt-1">{desc}</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-primary/10 px-8 py-6 flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/member/sanctuary')}
            className="p-2 -ml-2 rounded-full hover:bg-primary/5 text-primary/60 hover:text-primary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-2xl text-primary font-medium">Request Details</h1>
              {isLocked && <Lock size={14} className="text-[#b93c3c]" />}
            </div>
            <p className="font-sans text-sm text-primary/60">
              Tracking ID: <span className="font-mono text-xs ml-1 bg-primary/5 px-2 py-0.5 rounded">{id}</span>
            </p>
          </div>
        </div>
        
        {!isLocked && (
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-[#1c202e] hover:bg-[#1c202e]/90 text-white px-6 py-2.5 rounded text-sm font-medium transition-all active-sink shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            Finalize & Submit
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column - Main Content */}
        <div className="lg:w-[60%] flex flex-col gap-8">
          
          {/* Status Banner */}
          <div className="bg-surface rounded-xl p-6 halo-border flex items-start gap-4">
            <div className="bg-primary/5 p-3 rounded-full text-primary mt-1">
              {consultation.status === 'draft' ? <Edit2 size={24} /> : 
               consultation.status === 'scheduled' ? <Calendar size={24} /> : 
               <FileText size={24} />}
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold text-primary capitalize mb-1">
                Status: {consultation.status.replace('_', ' ')}
              </h2>
              <p className="font-sans text-sm text-primary/70 leading-relaxed">
                {consultation.status === 'draft' && "Your request is saved as a draft. You can continue editing your reason and summary. When ready, finalize the submission above."}
                {consultation.status === 'under_review' && "Your request has been securely submitted and is currently being reviewed by pastoral leadership."}
                {consultation.status === 'scheduled' && "A pastoral consultation has been provisioned. See session details below."}
                {consultation.status === 'completed' && "This consultation session has concluded."}
              </p>
            </div>
          </div>

          {/* Session Access (If Scheduled) */}
          {consultation.status === 'scheduled' && (
            <div className="bg-[#1c202e] rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="font-sans text-xs text-white/50 uppercase tracking-widest font-semibold mb-2">
                    Active Provision
                  </h3>
                  <h2 className="font-serif text-2xl font-medium mb-1">Pastoral Session Ready</h2>
                  <p className="font-sans text-sm text-white/70">
                    Your session is scheduled for {new Date(consultation.scheduledStart || consultation.selectedTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex flex-col items-stretch md:items-end gap-3">
                  {consultation.meetingMethod === 'in_person' ? (
                    <div className="bg-white/10 px-6 py-4 rounded text-center">
                      <span className="block font-sans text-xs text-white/50 uppercase tracking-wider mb-1">Location</span>
                      <span className="font-sans text-sm font-semibold">Church Office</span>
                    </div>
                  ) : (
                    <>
                      {joinState === 'upcoming' && (
                        <div className="bg-white/10 text-white/50 px-6 py-3 rounded font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed whitespace-nowrap">
                          <Clock size={18} />
                          Room unlocks {timeToMeeting}
                        </div>
                      )}
                      
                      {joinState === 'ready' && consultation.meetingLink && (
                        <a 
                          href={consultation.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-[#1c202e] hover:bg-white/90 px-6 py-3 rounded font-sans text-sm font-semibold transition-colors flex items-center justify-center gap-2 active-sink whitespace-nowrap"
                        >
                          <Video size={18} />
                          Join Secure Video Room
                        </a>
                      )}

                      {joinState === 'ended' && (
                        <div className="bg-white/10 text-white/50 px-6 py-3 rounded font-sans text-sm font-semibold flex items-center justify-center gap-2 cursor-default whitespace-nowrap">
                          <CheckCircle2 size={18} />
                          Session Completed
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          {consultation.status !== 'completed' && isLocked && (
            <div className="bg-surface rounded-xl p-6 halo-border mb-6">
              <h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary/10 pb-2">Session Actions</h3>
              <div className="space-y-3">
                <div className="w-full space-y-4">
                  {consultation.meetingLink && (
                    <a 
                      href={consultation.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-primary text-white hover:bg-[#b93c3c] py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink"
                    >
                      <Video size={16} /> Open Meeting Link
                    </a>
                  )}
                  
                  <button onClick={() => setIsEditingTime(!isEditingTime)} className="w-full bg-surface hover:bg-primary/5 text-primary py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink halo-border">
                    <Clock size={16} /> Reschedule Time
                  </button>
                  
                  {isEditingTime && (
                    <div className="mt-4 p-4 border border-primary/10 rounded-lg bg-surface space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">New Date</label>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-white border border-primary/10 rounded p-2 text-sm focus:outline-none focus:border-secondary" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wider">New Time</label>
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full bg-white border border-primary/10 rounded p-2 text-sm focus:outline-none focus:border-secondary" />
                      </div>
                      <button onClick={handleUpdateTime} disabled={isUpdatingTime} className="w-full bg-[#1c202e] hover:bg-[#1c202e]/90 text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-50">
                        {isUpdatingTime ? 'Updating...' : 'Confirm Reschedule'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Request Journey Timeline */}
          <div>
            <h3 className="font-sans text-xs text-primary/50 uppercase tracking-widest font-semibold mb-8">
              Request Journey
            </h3>
            
            <div className="relative border-l border-primary/10 ml-4 space-y-10 pb-4">
              {renderTimelineNode(
                'Request Drafted',
                consultation.status,
                'You have drafted the request details.',
                true,
                false
              )}
              {renderTimelineNode(
                'Final Submit & Review',
                consultation.status,
                'Lock and submit your request for pastoral assignment.',
                ['scheduled', 'completed', 'submitted'].includes(consultation.status),
                consultation.status === 'under_review' || consultation.status === 'submitted'
              )}
              {renderTimelineNode(
                'Meeting Scheduled',
                consultation.status,
                'A secure digital session has been provisioned.',
                consultation.status === 'completed' || consultation.status === 'scheduled',
                consultation.status === 'scheduled'
              )}
              {renderTimelineNode(
                'Completed',
                consultation.status,
                'Post-session reflections.',
                consultation.status === 'completed',
                consultation.status === 'completed'
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar Summary Column */}
        <div className="lg:w-[40%] flex flex-col gap-6">
          <div className="bg-surface rounded-xl p-8 halo-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans text-xs text-primary/50 uppercase tracking-widest font-semibold">
                Original Summary
              </h3>
              {!isLocked && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary hover:text-[#b93c3c] text-xs font-sans uppercase tracking-widest font-medium transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>
            
            <div className="mb-8">
              <span className="font-sans text-sm text-primary/50 block mb-2">Request Context</span>
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={reasonDraft}
                    onChange={(e) => setReasonDraft(e.target.value)}
                    className="w-full bg-background border border-primary/10 rounded-md p-4 font-sans text-sm text-primary focus:outline-none focus:border-[#b93c3c]/40 focus:ring-1 focus:ring-[#b93c3c]/40 transition-all resize-y min-h-[120px]"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleSaveReason}
                      className="px-4 py-2 bg-[#1c202e] text-white rounded text-sm font-medium hover:bg-[#2c2e35] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-base text-primary/80 leading-relaxed whitespace-pre-wrap">
                  {consultation.reason}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-sans text-sm text-primary/50 block mb-1">Urgency</span>
                <span className="font-sans text-base text-primary capitalize">{consultation.urgency}</span>
              </div>
              <div>
                <span className="font-sans text-sm text-primary/50 block mb-1">Requested Time</span>
                <span className="font-sans text-base text-primary">
                  {consultation.selectedTime ? new Date(consultation.selectedTime).toLocaleString() : 'TBD'}
                </span>
              </div>
            </div>
          </div>

          {/* Pastoral Notes & Comments */}
          <div className="bg-surface rounded-xl p-8 halo-border flex flex-col">
            <h3 className="font-sans text-xs text-primary/50 uppercase tracking-widest font-semibold mb-6">
              Notes & Updates
            </h3>
            
            <div className="flex-1 overflow-y-auto max-h-[300px] mb-4 space-y-4 pr-2">
              {notes.length === 0 ? (
                <p className="text-sm font-sans text-primary/40 italic">No notes yet.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className={\`p-4 rounded-lg \${note.authorId === user?.uid ? 'bg-background border border-primary/10 ml-4' : 'bg-primary/5 mr-4'}\`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-xs font-bold text-primary">{note.authorRole === 'member' ? 'You' : 'Pastor/Leader'}</span>
                      <span className="font-sans text-[10px] text-primary/50">{new Date(note.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-sans text-sm text-primary/80">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="relative mt-auto">
              <input 
                type="text" 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a secure note..."
                className="w-full bg-background border border-primary/10 rounded-md py-3 pl-4 pr-12 font-sans text-sm focus:outline-none focus:border-[#b93c3c]/40"
              />
              <button type="submit" disabled={!newNote.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary/50 hover:text-[#b93c3c] disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
