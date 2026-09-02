import { Link } from 'react-router-dom';
import { Video, FileText, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import { Consultation } from '../lib/firebase';

interface UpcomingConsultationBannerProps {
  session: Consultation | null;
  role: 'member' | 'pastor' | 'leader';
  loading?: boolean;
}

export function UpcomingConsultationBanner({ session, role, loading }: UpcomingConsultationBannerProps) {
  if (loading) {
    return (
      <div className="bg-[#1c202e] rounded-xl p-8 mb-10 shadow-lg text-white/50 flex items-center justify-center font-sans text-sm border border-white/10">
        Loading upcoming consultation details...
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatScheduledTime = (isoString?: string | null) => {
    if (!isoString) return 'Time Pending Confirmation';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const caseRecordLink = role === 'member' 
    ? `/member/request/${session.id}` 
    : `/pastor/request/${session.id}`;

  const otherPartyName = role === 'member'
    ? (session.leaderName || 'Pastoral Team')
    : (session.memberName || 'Congregant');

  const meetingUrl = session.googleMeetUrl || session.meetingLink || (session.meetingMethod !== 'in_person' ? 'https://meet.google.com/new' : '');

  const scheduledTimeStr = session.scheduledStart || session.selectedTime;

  return (
    <div className="bg-[#1c202e] rounded-xl p-6 md:p-8 mb-10 shadow-xl relative overflow-hidden text-white border border-white/10">
      {/* Ambient background highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b93c3c]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
            {session.meetingMethod === 'in_person' ? (
              <MapPin size={26} className="text-white/90" />
            ) : (
              <Video size={26} className="text-white/90" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-white font-sans text-[11px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb3ae]" />
                UPCOMING
              </span>
              
              <span className="text-white/60 font-sans text-xs">
                {session.meetingMethod === 'in_person' ? 'On-Campus Consultation' : 'Google Meet Video Consultation'}
              </span>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl text-white mb-1.5">
              {session.category || 'Spiritual Guidance'}
            </h2>

            <p className="font-sans text-sm text-white/80 leading-relaxed max-w-xl">
              Private pastoral consultation with <strong className="text-white font-semibold">{otherPartyName}</strong>.
              {scheduledTimeStr && (
                <span className="block mt-1 text-white/70">
                  Scheduled for {formatScheduledTime(scheduledTimeStr)}
                  {session.meetingMethod === 'in_person' && (
                    <> • Location: {session.meetingLocation || 'Sanctuary / Office'}</>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Suite with Join Room & Open Case Record */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {session.meetingMethod !== 'in_person' && (
            <button
              onClick={() => {
                const url = session.googleMeetUrl || session.meetingLink || 'https://meet.google.com/new';
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-2 bg-white text-[#1c202e] hover:bg-white/90 font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Video size={16} className="text-[#b93c3c]" />
              Join Video Room
            </button>
          )}

          <Link
            to={caseRecordLink}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-lg transition-colors border border-white/20 cursor-pointer"
          >
            <FileText size={15} />
            Open Case Record
          </Link>
        </div>
      </div>
    </div>
  );
}
