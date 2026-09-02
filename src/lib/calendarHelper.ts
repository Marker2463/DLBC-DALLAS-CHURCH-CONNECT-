import { Consultation } from './firebase';

/**
 * Generates an instant Google Calendar event template URL
 * which allows members and pastors to add the confirmed session
 * to their Google Calendar with one click, including description,
 * reminders, and Google Meet URL.
 */
export function generateGoogleCalendarUrl(consultation: Consultation): string {
  const startTime = consultation.scheduledStart || consultation.selectedTime || new Date().toISOString();
  const start = new Date(startTime);
  const endTimeStr = consultation.scheduledEnd;
  const end = endTimeStr ? new Date(endTimeStr) : new Date(start.getTime() + 45 * 60000);

  const formatGoogleCalendarDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const dates = `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`;
  const title = encodeURIComponent(`DLBC Pastoral Consultation — ${consultation.category || 'Pastoral Care'}`);
  
  const meetUrl = consultation.meetingLink || consultation.googleMeetUrl;
  const isOnline = consultation.meetingMethod !== 'in_person';

  const details = encodeURIComponent(
    `DLBC Church Connect — Confidential Pastoral Care Session\n\n` +
    `• Member: ${consultation.memberName || 'Congregant'}\n` +
    `• Spiritual Leader / Pastor: ${consultation.leaderName || 'Pastoral Team'}\n` +
    `• Category: ${consultation.category || 'General Consultation'}\n` +
    `• Urgency: ${(consultation.urgency || 'Normal').toUpperCase()}\n` +
    (meetUrl ? `• Video Room (Google Meet): ${meetUrl}\n` : '') +
    (consultation.meetingMethod === 'in_person' ? `• Location: ${consultation.meetingLocation || 'Church Sanctuary'}\n` : '') +
    `\nReason for consultation: "${consultation.reason || 'Spiritual guidance & prayer'}"\n\n` +
    `Pastoral Non-Disclosure & Confidentiality Assured.`
  );

  const location = encodeURIComponent(
    isOnline
      ? (meetUrl || 'Google Meet Video Sanctuary')
      : (consultation.meetingLocation || 'DLBC Church Office / Sanctuary')
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
