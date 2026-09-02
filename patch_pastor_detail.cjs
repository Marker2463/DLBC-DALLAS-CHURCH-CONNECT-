const fs = require('fs');
let content = fs.readFileSync('src/pages/pastor/RequestDetail.tsx', 'utf8');

// 1. Add state for editing
const stateImports = `
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
`;

content = content.replace('const [joinError, setJoinError] = useState("");', 'const [joinError, setJoinError] = useState("");\n' + stateImports);

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
          { status: 'Rescheduled', timestamp: new Date().toISOString(), description: \`Meeting rescheduled to \${new Date(selectedTime).toLocaleString()}\` }
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
content = content.replace('const handleMarkCompleted = async () => {', handleUpdate + '\n  const handleMarkCompleted = async () => {');

// 3. Add edit button and inline form
const editUI = `
              {consultation.status !== 'completed' && (
                <>
                  <button onClick={handleMarkCompleted} className="w-full bg-primary hover:bg-primary/90 text-background py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink">
                    <Check size={16} /> Mark as Completed
                  </button>
                  <button onClick={() => setIsEditingTime(!isEditingTime)} className="w-full bg-surface-dim hover:bg-primary/5 text-primary py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink">
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
`;

content = content.replace(/\{consultation\.status !== 'completed' && \(\s*<button onClick=\{handleMarkCompleted\}[\s\S]*?<\/button>\s*\)\}/, editUI);

fs.writeFileSync('src/pages/pastor/RequestDetail.tsx', content);
