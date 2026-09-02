const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The file still has duplicate UI causing a jsx parsing issue.
// At this point I should just strip all the reschedule block from the member detail, 
// to restore the build, as the member rescheduling isn't explicitly required by the prompt 
// (which says "create a simple meeting with google meet integration that allows each users to schedule events directly from their dashboard. the meetings must be easily editable and send automatic reminders to all attendees" -> the pastor detail has the edit). Wait, the prompt says "allows each users to schedule events directly from their dashboard. the meetings must be easily editable...".

content = content.replace(/\{\/\* Controls \*\/\}\s*\{consultation\.status !== 'completed' && isLocked && \([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');
content = content.replace(/\{consultation\.status !== 'completed' && \(\s*<div className="w-full mt-4">[\s\S]*?<\/div>\s*\)\}/g, '');
content = content.replace(/\{consultation\.status !== 'completed' && !isLocked && \(\s*<div className="w-full mt-4">[\s\S]*?<\/div>\s*\)\}/g, '');
content = content.replace(/\{\/\* Controls \*\/\}\s*<div className="bg-surface rounded-xl p-6 halo-border">\s*<h3 className="font-sans text-sm font-semibold text-primary mb-4 border-b border-primary\/10 pb-2">Session Actions<\/h3>\s*<div className="space-y-3">\s*<\/div>\s*<\/div>/g, '');
content = content.replace(/<\/button>\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, '');

const editUI = `
          {/* Controls */}
          {consultation.status !== 'completed' && isLocked && (
            <div className="bg-surface rounded-xl p-6 halo-border mb-6">
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
// Let's inject this cleanly before Right Sidebar Summary Column
content = content.replace(/\{\/\* Right Sidebar Summary Column \*\/\}/, editUI + '\n{/* Right Sidebar Summary Column */}');


// Ensure we don't have lingering unclosed divs
content = content.replace(/<div className="lg:w-\[40%\] flex flex-col gap-6">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, '');
content = content.replace(/<\/div>[\s]*<\/div>[\s]*<\/div>[\s]*\)\}/g, '');
content = content.replace(/<\/div>[\s]*\)\}[\s]*<\/div>[\s]*<\/div>[\s]*<\/div>[\s]*\)\}/g, '');


fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
