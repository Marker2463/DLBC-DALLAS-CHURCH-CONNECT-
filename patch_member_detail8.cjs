const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// There is a dangling syntax error around line 291
// Let's remove the extra closing bracket
content = content.replace(/\{consultation\.status !== 'completed' && \([\s\S]*?\)\}/g, '');
content = content.replace(/\{\/\* Controls \*\/\}\s*<div className="bg-surface rounded-xl p-6 halo-border">\s*<h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary\/10 pb-2">Session Actions<\/h3>\s*<div className="space-y-3">\s*<\/div>\s*<\/div>/g, '');

const editUI = `
          {/* Controls */}
          <div className="bg-surface rounded-xl p-6 halo-border">
            <h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary/10 pb-2">Session Actions</h3>
            <div className="space-y-3">
              {consultation.status !== 'completed' && (
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
              )}
            </div>
          </div>
`;
content = content.replace(/\{\/\* PRIVACY SHIELD \*\/\}/g, editUI + '\n          {/* PRIVACY SHIELD */}');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
