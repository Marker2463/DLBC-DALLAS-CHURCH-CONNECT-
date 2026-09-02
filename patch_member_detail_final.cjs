const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// 1. imports
content = content.replace('import { ChevronLeft, FileText, Calendar, Edit2, CheckCircle2, ShieldCheck, Loader2, Video, Lock } from "lucide-react";', 'import { ChevronLeft, FileText, Calendar, Edit2, CheckCircle2, ShieldCheck, Loader2, Video, Lock, Clock } from "lucide-react";');

// 2. state
const stateImports = `
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
`;
content = content.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const [isSubmitting, setIsSubmitting] = useState(false);\n' + stateImports);


// 3. handler
const handleUpdate = `
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

      setIsEditingTime(false);
    } catch (err) {
      console.error("Failed to update time", err);
    } finally {
      setIsUpdatingTime(false);
    }
  };
`;
content = content.replace('const handleFinalSubmit = async () => {', handleUpdate + '\n  const handleFinalSubmit = async () => {');


// 4. Submit handler update for calendar
const newSubmit = `
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
`;

content = content.replace(/const handleFinalSubmit = async \(\) => \{[\s\S]*?navigate\('\/member\/sanctuary'\);\n    \} catch \(err\) \{\n      console.error\(err\);\n    \} finally \{\n      setIsSubmitting\(false\);\n    \}\n  \};/, newSubmit);



// 5. UI
const editUI = `
          {/* Controls */}
          {consultation.status !== 'completed' && isLocked && (
            <div className="bg-surface rounded-xl p-6 halo-border">
              <h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary/10 pb-2">Session Actions</h3>
              <div className="space-y-3">
                <div className="w-full">
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
`;
content = content.replace(/<div className="bg-surface rounded-xl p-8 halo-border">\s*<h3 className="font-serif text-lg text-primary mb-4 border-b border-primary\/10 pb-2">Summary<\/h3>/, editUI + '\n<div className="bg-surface rounded-xl p-8 halo-border">\n<h3 className="font-serif text-lg text-primary mb-4 border-b border-primary/10 pb-2">Summary</h3>');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
