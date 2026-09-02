const fs = require('fs');
let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

// The regex replace created a weird hanging fragment
content = content.replace(/className="w-full bg-surface hover:bg-primary\/5 text-primary py-3 rounded-md font-sans text-sm font-medium transition-colors flex items-center justify-center gap-2 active-sink halo-border">\s*<Clock size=\{16\} \/> Reschedule Time\s*<\/button>[\s\S]*?<\/button>\s*<\/div>\s*\)\}\s*<\/div>/g, '');

const editUI = `
            {consultation.status !== 'completed' && (
              <div className="w-full mt-4">
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
`;
content = content.replace(/<\/div>\s*<\/div>\s*<div className="flex flex-col lg:flex-row gap-12">/, editUI + '\n</div>\n</div>\n<div className="flex flex-col lg:flex-row gap-12">');

fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
