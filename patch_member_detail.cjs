const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// 1. Add state for editing
const stateImports = `
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
`;

content = content.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const [isSubmitting, setIsSubmitting] = useState(false);\n' + stateImports);

// 2. Add handleUpdateTime
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

// 3. Add edit button and inline form
const editUI = `
            {consultation.status !== 'completed' && (
              <>
                <button onClick={() => setIsEditingTime(!isEditingTime)} className="w-full bg-surface hover:bg-primary/5 text-primary py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink halo-border mt-4">
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
              </>
            )}
          </div>
`;

content = content.replace(/<div className="flex flex-col lg:flex-row gap-12">[\s\S]*?<\/div>[\s\S]*?<\/div>/, (match) => {
    return match.replace(/<\/div>\s*<\/div>\s*$/, editUI);
});


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
