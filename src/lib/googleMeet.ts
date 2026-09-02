import { google } from 'googleapis';

function getCalendarClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Calendar Service Account environment variables are missing.');
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  return google.calendar({ version: 'v3', auth });
}

interface CreateGoogleMeetEventArgs {
  consultationId: string;
  summary: string;
  startTimeIso: string;
  durationMinutes: number;
}

export async function createGoogleMeetEvent({
  consultationId,
  summary,
  startTimeIso,
  durationMinutes,
}: CreateGoogleMeetEventArgs): Promise<string> {
  const calendar = getCalendarClient();
  const endTimeIso = new Date(new Date(startTimeIso).getTime() + durationMinutes * 60000).toISOString();

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      start: { dateTime: startTimeIso },
      end: { dateTime: endTimeIso },
      conferenceData: {
        createRequest: {
          requestId: `meet-${consultationId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const meetUrl = event.data.hangoutLink || event.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;
  if (!meetUrl) {
    throw new Error('Google Calendar did not return a valid Google Meet link.');
  }
  return meetUrl;
}
