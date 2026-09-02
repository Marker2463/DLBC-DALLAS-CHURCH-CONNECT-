import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Lock, AlertTriangle, Clock, Check, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { db, Consultation } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

import { StepSchedule } from '../../components/member/StepSchedule';

const categories = [
  "Spiritual Guidance",
  "Family & Marriage",
  "Youth Mentorship",
  "Bereavement Support",
  "Life Transitions"
];

const urgencies = [
  {
    id: "standard",
    title: "Standard Care",
    description: "Guidance within 3-5 days. For non-urgent spiritual discussions.",
    icon: Clock
  },
  {
    id: "priority",
    title: "Priority Care",
    description: "Response within 24-48 hours. When you need timely support.",
    icon: Clock
  },
  {
    id: "crisis",
    title: "Crisis Intervention",
    description: "Immediate pastoral attention needed. Confidential crisis care.",
    icon: AlertTriangle
  }
];

export function Request() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(categories[0]);
  const [urgency, setUrgency] = useState(urgencies[0].id);
  const [reason, setReason] = useState("");
  const [maskIdentity, setMaskIdentity] = useState(!isAuthenticated);
  
  const [meetingMethod, setMeetingMethod] = useState<'zoom'|'google_meet'|'in_person' | null>(null);
  const [meetingLocation, setMeetingLocation] = useState("");
  
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);
  const [selectedLeaderName, setSelectedLeaderName] = useState<string | null>(null);
  const [selectedLeaderEmail, setSelectedLeaderEmail] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setMaskIdentity(true);
    }
  }, [isAuthenticated]);

  const handleNext = () => {
    if (step === 4) {
      if (!meetingMethod) return;
      if (meetingMethod === 'in_person' && !meetingLocation) return;
    }
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
       navigate('/auth/login');
       return;
    }
    
    if (!selectedDate || !selectedTimeSlot || !selectedLeaderId) {
      alert('Please select a leader, date, and time slot.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate ISO string for selected time
      const [time, modifier] = selectedTimeSlot.split(' ');
      let [hours, minutes] = time.split(':');
      let hrs = parseInt(hours, 10);
      if (hrs === 12) {
        hrs = modifier === 'AM' ? 0 : 12;
      } else if (modifier === 'PM') {
        hrs += 12;
      }
      
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hrs, parseInt(minutes, 10), 0, 0);

      const scheduledStart = finalDate.toISOString();
      const scheduledEnd = new Date(finalDate.getTime() + 45 * 60000).toISOString();

      const consultationData: Omit<Consultation, 'id'> = {
        memberId: user.uid,
        memberName: maskIdentity ? 'Anonymous' : user.displayName,
        leaderId: selectedLeaderId,
        leaderName: selectedLeaderName,
        category,
        urgency,
        reason,
        attachments: [],
        selectedTime: scheduledStart,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
        status: 'under_review',
        isLocked: false,
        meetingMethod: meetingMethod || 'google_meet',
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
      navigate(`/member/request/${docRef.id}`);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] pb-32">
      <div className={`w-full px-6 flex flex-col flex-grow transition-all duration-500 ${step === 5 ? 'max-w-4xl' : 'max-w-[600px]'}`}>
        
        <div className="text-center mb-16 pt-12">
          <h1 className="font-serif text-4xl text-primary mb-4">Request Consultation</h1>
          <p className="font-sans text-lg text-primary/70">Step forward in faith. We are here to listen.</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10 -z-10"></div>
          
          {[
            { stepNum: 1, label: "Category" },
            { stepNum: 2, label: "Urgency" },
            { stepNum: 3, label: "Reason" },
            { stepNum: 4, label: "Method" },
            { stepNum: 5, label: "Schedule" }
          ].map((s) => (
            <div key={s.stepNum} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-sm ${step >= s.stepNum ? 'bg-primary text-white' : 'bg-surface text-primary/50 halo-border'}`}>
                {step > s.stepNum ? <Check size={16} /> : s.stepNum}
              </div>
              <span className={`font-sans text-[10px] sm:text-xs uppercase tracking-widest ${step >= s.stepNum ? 'text-primary font-semibold' : 'text-primary/50 font-medium'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1 Content: Category */}
        {step === 1 && (
          <div className="flex-grow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl text-primary mb-2">Area of Need</h2>
              
              {categories.map((cat, i) => (
                <label key={i} className="relative block cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    className="peer sr-only" 
                    checked={category === cat}
                    onChange={() => setCategory(cat)} 
                  />
                  <div className="w-full p-6 bg-surface rounded-lg halo-border peer-checked:border-primary peer-checked:bg-surface-dim/30 transition-all duration-300 flex items-center justify-between active-sink">
                    <span className="font-sans text-lg text-primary group-hover:text-secondary transition-colors">{cat}</span>
                    <ArrowRight size={20} className="text-primary/30 peer-checked:text-primary transition-colors" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 Content: Urgency */}
        {step === 2 && (
          <div className="flex-grow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl text-primary mb-2">Pace of Care</h2>
              
              {urgencies.map((urg) => {
                const Icon = urg.icon;
                return (
                  <label key={urg.id} className="relative block cursor-pointer group">
                    <input 
                      type="radio" 
                      name="urgency" 
                      className="peer sr-only" 
                      checked={urgency === urg.id}
                      onChange={() => setUrgency(urg.id)} 
                    />
                    <div className="w-full p-6 bg-surface rounded-lg halo-border peer-checked:border-primary peer-checked:bg-surface-dim/30 transition-all duration-300 flex items-start gap-4 active-sink">
                      <div className={`p-2 rounded-full mt-1 transition-colors ${urgency === urg.id ? 'bg-primary text-white' : 'bg-background text-primary/40 group-hover:text-secondary'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="block font-sans text-lg font-medium text-primary mb-1">{urg.title}</span>
                        <span className="block font-sans text-sm text-primary/60">{urg.description}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 Content: Reason */}
        {step === 3 && (
          <div className="flex-grow flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl text-primary mb-2">Heart of the Matter</h2>
              <p className="font-sans text-sm text-primary/70 mb-2">
                Share what's on your mind. This helps us assign the right pastoral care. 
              </p>
              
              <textarea
                className="w-full h-48 bg-surface halo-border rounded-lg p-6 text-primary placeholder:text-primary/30 font-sans text-base resize-none focus:outline-none focus:ring-1 focus:ring-secondary/20 focus:border-secondary/40 transition-colors"
                placeholder="I am seeking guidance regarding..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="bg-[#1c202e] text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/70 font-sans text-xs uppercase tracking-widest mb-3 font-semibold">
                  <Lock size={14} className="text-[#ffb3ae]" />
                  Confidentiality Guarantee
                </div>
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id="maskIdentity"
                      checked={maskIdentity}
                      disabled={!isAuthenticated}
                      onChange={(e) => setMaskIdentity(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 text-[#b93c3c] focus:ring-[#b93c3c] bg-white/10 accent-[#b93c3c] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label htmlFor="maskIdentity" className={`font-sans text-sm font-semibold text-white ${!isAuthenticated ? 'opacity-80' : 'cursor-pointer'} block mb-1`}>
                      Mask my identity during initial review
                    </label>
                    <p className="font-sans text-xs text-white/70">
                      {isAuthenticated 
                        ? "When enabled, your name and contact history are hidden until you grant the responding pastor specific access."
                        : "You are currently signed out. Your request will be submitted completely anonymously."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        
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
        {step === 5 && (
          <div className="flex-grow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
            <StepSchedule 
              category={category}
              onSlotSelected={(lId, lName, d, t, lEmail) => {
                setSelectedLeaderId(lId);
                setSelectedLeaderName(lName);
                setSelectedLeaderEmail(lEmail || null);
                setSelectedDate(d);
                setSelectedTimeSlot(t);
              }}
              selectedLeaderId={selectedLeaderId}
              selectedTimeSlot={selectedTimeSlot}
              selectedDate={selectedDate}
            />
          </div>
        )}
      </div>

      {/* Sanctuary Bar (Bottom Action Bar) */}
      <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-primary/5 py-4 px-6 z-40 flex justify-center">
        <div className={`w-full flex justify-between items-center transition-all duration-500 ${step === 5 ? 'max-w-4xl' : 'max-w-[600px]'}`}>
          {step > 1 ? (
            <button onClick={handleBack} disabled={isSubmitting} className="flex items-center gap-2 font-sans text-sm text-primary/70 hover:text-primary transition-colors py-3 px-6 rounded-md hover:bg-surface-dim/50">
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <Link to="/member/dashboard" className="font-sans text-sm text-primary/70 hover:text-primary transition-colors py-3 px-6 rounded-md hover:bg-surface-dim/50">
              Cancel
            </Link>
          )}
          
          <button 
            onClick={handleNext} 
            disabled={isSubmitting}
            className="bg-primary text-white font-sans text-sm font-medium py-3 px-8 rounded-md active-sink flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : step === 5 ? "Continue to Summary" : `Continue to ${step === 1 ? 'Urgency' : step === 2 ? 'Reason' : step === 3 ? 'Method' : 'Schedule'}`}
            {!isSubmitting && step < 5 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
