const fs = require('fs');
let content = fs.readFileSync('/tmp/Request.tsx', 'utf8');

// 1. Add state variables
content = content.replace(
  /const \[reason, setReason\] = useState\(""\);\n  const \[maskIdentity, setMaskIdentity\] = useState\(!isAuthenticated\);/,
  `const [reason, setReason] = useState("");
  const [maskIdentity, setMaskIdentity] = useState(!isAuthenticated);
  
  const [meetingMethod, setMeetingMethod] = useState<'zoom'|'google_meet'|'in_person' | null>(null);
  const [meetingLocation, setMeetingLocation] = useState("");`
);

// 2. update handleNext
content = content.replace(
  /const handleNext = \(\) => {\n    if \(step < 4\) setStep\(step \+ 1\);\n    else handleSubmit\(\);\n  };/,
  `const handleNext = () => {
    if (step === 4) {
      if (!meetingMethod) return;
      if (meetingMethod === 'in_person' && !meetingLocation) return;
    }
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };`
);

// 3. remove google Meet fetch and update consultationData
content = content.replace(
  /        googleMeetUrl: null,\n        meetingLink: null,\n        googleEventId: null,[\s\S]*?navigate\(\`\/member\/request\/\$\{docRef\.id\}\`\);/,
  `        meetingMethod: meetingMethod || 'google_meet',
        meetingLocation: meetingMethod === 'in_person' ? meetingLocation : null,
        meetingLinkStatus: 'pending',
        meetingLink: null,
        googleMeetUrl: null,
        googleEventId: null,
        journeyTimeline: [
          { status: 'Request Submitted', timestamp: new Date().toISOString(), description: 'Your request has been securely submitted.' }
        ]
      };

      const docRef = await addDoc(collection(db, 'consultations'), consultationData);
      
      // Navigate to the Details page
      navigate(\`/member/request/\${docRef.id}\`);`
);

// 4. Update max-w classes
content = content.replace(
  /max-w-4xl/g,
  'max-w-4xl'
);
// Wait, I just need to replace `step === 4 ? 'max-w-4xl'` with `step === 5 ? 'max-w-4xl'`
content = content.replace(
  /step === 4 \? 'max-w-4xl'/g,
  `step === 5 ? 'max-w-4xl'`
);

// 5. Update Stepper
content = content.replace(
  /\{\[[\s\S]*?\]\.map\(\(s\) => \(/,
  `{[
            { stepNum: 1, label: "Category" },
            { stepNum: 2, label: "Urgency" },
            { stepNum: 3, label: "Reason" },
            { stepNum: 4, label: "Method" },
            { stepNum: 5, label: "Schedule" }
          ].map((s) => (`
);

// 6. Update step 4 text to step 5 text in bottom bar
content = content.replace(
  /step === 4 \? "Continue to Summary" : `Continue to \$\{step === 1 \? 'Urgency' : step === 2 \? 'Reason' : 'Schedule'\}`/,
  `step === 5 ? "Continue to Summary" : \`Continue to \${step === 1 ? 'Urgency' : step === 2 ? 'Reason' : step === 3 ? 'Method' : 'Schedule'}\``
);
content = content.replace(
  /step < 4 && <ArrowRight size=\{16\} \/>/,
  `step < 5 && <ArrowRight size={16} />`
);

// 7. Insert Step 4 Content
const step4Html = `
        {/* Step 4 Content: Method */}
        {step === 4 && (
          <div className="flex-grow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl text-primary mb-2">How would you like to meet?</h2>
              <p className="font-sans text-sm text-primary/70 mb-2">Choose the format that feels right for this conversation.</p>
              
              {[
                { id: 'zoom', title: 'Video Call — Zoom', subtext: 'Join from any device via Zoom.' },
                { id: 'google_meet', title: 'Video Call — Google Meet', subtext: 'Join directly from your browser, no download required.' },
                { id: 'in_person', title: 'In-Person', subtext: 'Meet with your pastor or leader on campus.' }
              ].map((m) => (
                <label key={m.id} className="relative block cursor-pointer group">
                  <input 
                    type="radio" 
                    name="meetingMethod" 
                    className="peer sr-only" 
                    checked={meetingMethod === m.id}
                    onChange={() => setMeetingMethod(m.id as any)} 
                  />
                  <div className="w-full p-6 bg-surface rounded-lg halo-border peer-checked:border-primary peer-checked:bg-surface-dim/30 transition-all duration-300 flex items-center justify-between active-sink">
                    <div>
                      <span className="block font-sans text-lg text-primary group-hover:text-secondary transition-colors mb-1">{m.title}</span>
                      <span className="block font-sans text-sm text-primary/60">{m.subtext}</span>
                    </div>
                    <ArrowRight size={20} className="text-primary/30 peer-checked:text-primary transition-colors" />
                  </div>
                </label>
              ))}

              {meetingMethod === 'in_person' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block font-sans text-sm font-semibold text-primary mb-2">Campus Location *</label>
                  <select 
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className="w-full bg-surface border border-primary/10 rounded-lg p-4 font-sans text-base text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all cursor-pointer appearance-none"
                    required
                  >
                    <option value="" disabled>[ Select a location ▾ ]</option>
                    <option value="Main Campus — Room 204">Main Campus — Room 204</option>
                    <option value="Youth Building — Fellowship Hall">Youth Building — Fellowship Hall</option>
                    <option value="Pastor's Office">Pastor's Office</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5 Content: Schedule Time */}
        {step === 5 && (`;

content = content.replace(
  /\{\/\* Step 4 Content: Schedule Time \*\/\}\n        \{step === 4 && \(/,
  step4Html
);

fs.writeFileSync('/tmp/Request.tsx', content);
