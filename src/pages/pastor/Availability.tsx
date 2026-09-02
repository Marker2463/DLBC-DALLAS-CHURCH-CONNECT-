import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { db, LeaderAvailability } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Save, Clock, CalendarOff } from 'lucide-react';
import { addMinutes, format, parse } from 'date-fns';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function generateSlots(startTime: string, endTime: string, duration: number = 45): string[] {
  if (!startTime || !endTime) return [];
  try {
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());
    const slots: string[] = [];
    let current = start;

    while (addMinutes(current, duration) <= end) {
      slots.push(format(current, 'hh:mm a'));
      current = addMinutes(current, duration);
    }
    return slots;
  } catch (e) {
    return [];
  }
}

export function PastorAvailability() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; startTime: string; endTime: string; slots: string[] }>>({
    Monday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Tuesday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Wednesday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Thursday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Friday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Saturday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] },
    Sunday: { enabled: false, startTime: '09:00', endTime: '17:00', slots: [] }
  });

  const [blackoutDates, setBlackoutDates] = useState<string[]>([]);
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  useEffect(() => {
    async function loadAvailability() {
      if (!user) return;
      const docRef = doc(db, 'availability', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as LeaderAvailability;
        if (data.weeklySchedule) {
          const updatedSchedule = { ...schedule };
          for (const day of DAYS_OF_WEEK) {
            if (data.weeklySchedule[day]) {
              // We don't store startTime/endTime in DB natively, just slots. 
              // We'll infer a basic range or just rely on user setting it if we don't save start/end.
              // To make this robust, let's just use what they have, but for a full app we'd save start/end too.
              updatedSchedule[day] = {
                enabled: data.weeklySchedule[day].enabled,
                slots: data.weeklySchedule[day].slots || [],
                startTime: data.weeklySchedule[day].slots.length > 0 ? data.weeklySchedule[day].slots[0] : '09:00',
                endTime: '17:00' // Default fallback
              };
            }
          }
          setSchedule(updatedSchedule);
        }
        if (data.blackoutDates) {
          setBlackoutDates(data.blackoutDates);
        }
      }
      setLoading(false);
    }
    loadAvailability();
  }, [user]);

  const handleToggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const handleTimeChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const addBlackoutDate = () => {
    if (newBlackoutDate && !blackoutDates.includes(newBlackoutDate)) {
      setBlackoutDates(prev => [...prev, newBlackoutDate].sort());
      setNewBlackoutDate('');
    }
  };

  const removeBlackoutDate = (dateToRemove: string) => {
    setBlackoutDates(prev => prev.filter(d => d !== dateToRemove));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const weeklyScheduleToSave: Record<string, { enabled: boolean; slots: string[] }> = {};
    for (const day of DAYS_OF_WEEK) {
      const dayConfig = schedule[day];
      const slots = dayConfig.enabled ? generateSlots(dayConfig.startTime, dayConfig.endTime, 45) : [];
      weeklyScheduleToSave[day] = {
        enabled: dayConfig.enabled,
        slots
      };
      
      // Update local state slots for display if needed
      schedule[day].slots = slots;
    }

    const dataToSave: LeaderAvailability = {
      leaderId: user.uid,
      weeklySchedule: weeklyScheduleToSave,
      blackoutDates
    };

    try {
      await setDoc(doc(db, 'availability', user.uid), dataToSave);
      // Show success somehow
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 w-full py-12 pb-32">
      <div className="mb-12">
        <h1 className="font-serif text-4xl text-primary mb-4">Availability & Scheduling</h1>
        <p className="font-sans text-lg text-primary/70">Manage your weekly ministry hours and blocked dates.</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Weekly Schedule */}
        <div className="bg-surface rounded-xl p-8 border border-primary/10">
          <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4">
            <Clock className="text-[#b93c3c]" size={24} />
            <h2 className="font-serif text-2xl text-primary">Weekly Schedule</h2>
          </div>
          
          <div className="space-y-6">
            {DAYS_OF_WEEK.map(day => {
              const config = schedule[day];
              return (
                <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-xl bg-white border border-[#e2dcce] shadow-sm">
                  <div className="w-40 flex items-center gap-3 cursor-pointer" onClick={() => handleToggleDay(day)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.enabled ? 'bg-[#b93c3c] border-[#b93c3c]' : 'bg-[#faf8f5] border-[#e2dcce]'}`}>
                      {config.enabled && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="font-sans text-sm font-semibold text-primary select-none">{day}</span>
                  </div>
                  
                  {config.enabled ? (
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <input 
                          type="time" 
                          value={config.startTime}
                          onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                          className="appearance-none bg-[#faf8f5] border border-[#e2dcce] rounded-md px-3 py-2 font-sans text-sm text-primary focus:outline-none focus:border-[#1e232a] focus:ring-1 focus:ring-[#1e232a] transition-colors"
                        />
                      </div>
                      <span className="text-primary/50 text-sm font-medium">to</span>
                      <div className="relative">
                        <input 
                          type="time" 
                          value={config.endTime}
                          onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                          className="appearance-none bg-[#faf8f5] border border-[#e2dcce] rounded-md px-3 py-2 font-sans text-sm text-primary focus:outline-none focus:border-[#1e232a] focus:ring-1 focus:ring-[#1e232a] transition-colors"
                        />
                      </div>
                      <span className="ml-4 font-sans text-xs font-bold text-secondary uppercase tracking-widest hidden md:inline-block">
                        45m slots
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span className="font-sans text-sm text-primary/40 italic">Unavailable</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Blackout Dates */}
        <div className="bg-surface rounded-xl p-8 border border-primary/10">
          <div className="flex items-center gap-3 mb-6 border-b border-primary/10 pb-4">
            <CalendarOff className="text-[#b93c3c]" size={24} />
            <h2 className="font-serif text-2xl text-primary">Blackout Dates</h2>
          </div>
          
          <p className="font-sans text-sm text-primary/70 mb-4">
            Select specific dates when you will be unavailable for consultations (e.g., retreats, holidays).
          </p>
          
          <div className="flex gap-4 mb-6">
            <input 
              type="date" 
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              className="bg-background border border-primary/10 rounded px-4 py-2 font-sans text-sm text-primary focus:outline-none focus:border-[#b93c3c]/50"
            />
            <button 
              onClick={addBlackoutDate}
              disabled={!newBlackoutDate}
              className="bg-[#1c202e] text-white px-4 py-2 rounded font-sans text-sm font-medium hover:bg-[#2c2e35] transition-colors disabled:opacity-50"
            >
              Add Date
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {blackoutDates.length === 0 ? (
              <span className="text-sm font-sans text-primary/40 italic">No blackout dates set.</span>
            ) : (
              blackoutDates.map(date => (
                <div key={date} className="flex items-center gap-2 bg-background border border-primary/10 rounded-full px-4 py-1.5">
                  <span className="font-sans text-sm text-primary">{date}</span>
                  <button 
                    onClick={() => removeBlackoutDate(date)}
                    className="text-primary/40 hover:text-[#b93c3c] transition-colors"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#1e232a] hover:bg-[#2c323b] text-white px-8 py-4 rounded font-sans text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

      </div>
    </div>
  );
}
