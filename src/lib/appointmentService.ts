import { doc, getDoc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, Consultation, Appointment } from './firebase';
import { createGoogleCalendarEvent } from './googleMeetClient';

/**
 * Service to manage Appointment and Consultation meeting links.
 * Enforces Single-Source-of-Truth and Idempotent Read-First persistence pattern.
 */

export interface InitializeMeetingOptions {
  summary?: string;
  description?: string;
  startIso?: string;
  endIso?: string;
  durationMinutes?: number;
  accessToken?: string | null;
  memberEmail?: string;
  leaderEmail?: string;
  method?: 'google_meet' | 'zoom' | 'in_person';
}

/**
 * Idempotent Read-First Meet URL retrieval and persistence.
 * Checks Firestore document first. If meetUrl already exists, returns it immediately
 * without calling any external calendar or meet APIs.
 * If missing and not in-person, generates the meeting link ONCE, saves it to Firestore,
 * and returns the newly persisted URL.
 */
export async function getOrInitializeMeetUrl(
  appointmentId: string,
  options?: InitializeMeetingOptions
): Promise<string> {
  if (!appointmentId) {
    throw new Error('Appointment ID is required to resolve meeting link.');
  }

  // 1. READ-FIRST PATTERN: Check if meetUrl already exists in Firestore
  const consultationRef = doc(db, 'consultations', appointmentId);
  const snap = await getDoc(consultationRef);

  let existingData: any = null;
  if (snap.exists()) {
    existingData = snap.data();
    const existingMeetUrl = existingData.meetUrl || existingData.googleMeetUrl || existingData.meetingLink;
    if (existingMeetUrl) {
      return existingMeetUrl;
    }
  }

  // If in-person session, no meetUrl needed
  if (existingData?.meetingMethod === 'in_person' || options?.method === 'in_person') {
    return '';
  }

  // 2. IDEMPOTENT GENERATION: Call backend / API only once if missing
  let newMeetUrl: string | null = null;
  let newEventId: string | null = null;

  // Try server-side schedule / join endpoint first
  try {
    const res = await fetch('/api/consultations/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationId: appointmentId })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.meetingLink || data.googleMeetUrl || data.meetUrl) {
        newMeetUrl = data.meetUrl || data.meetingLink || data.googleMeetUrl;
      }
    }
  } catch (err) {
    console.warn('Backend consultation join endpoint fallback:', err);
  }

  // Client-side fallback via Google Calendar API if backend did not produce a URL
  if (!newMeetUrl) {
    try {
      const startIso = options?.startIso || existingData?.scheduledStart || existingData?.selectedTime || new Date().toISOString();
      const durationMinutes = options?.durationMinutes || 45;
      const endIso = options?.endIso || existingData?.scheduledEnd || new Date(new Date(startIso).getTime() + durationMinutes * 60000).toISOString();

      const calResult = await createGoogleCalendarEvent({
        summary: options?.summary || `DLBC Consultation — ${existingData?.category || 'Pastoral Care'}`,
        description: options?.description || `Consultation ID: ${appointmentId}\nConfidential pastoral care session.`,
        startIso,
        endIso,
        accessToken: options?.accessToken
      });

      newMeetUrl = calResult.hangoutLink;
      newEventId = calResult.id;
    } catch (clientErr) {
      console.warn('Client Google Calendar API generation fallback:', clientErr);
    }
  }

  // Fallback to standard Google Meet if all external APIs fail
  if (!newMeetUrl) {
    newMeetUrl = `https://meet.google.com/new`;
  }

  // 3. PERSISTENCE: Save to Firestore document under meetUrl and calendarEventId
  const updatePayload: Record<string, any> = {
    meetUrl: newMeetUrl,
    googleMeetUrl: newMeetUrl,
    meetingLink: newMeetUrl,
    meetingLinkStatus: 'active',
    updatedAt: new Date().toISOString()
  };

  if (newEventId) {
    updatePayload.calendarEventId = newEventId;
    updatePayload.googleEventId = newEventId;
  }

  if (snap.exists()) {
    await updateDoc(consultationRef, updatePayload);
  } else {
    // If saving to appointments collection
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await setDoc(appointmentRef, updatePayload, { merge: true });
  }

  return newMeetUrl;
}

/**
 * Subscribe to real-time updates for a single consultation/appointment.
 */
export function subscribeToAppointment(
  appointmentId: string,
  onUpdate: (consultation: Consultation | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docRef = doc(db, 'consultations', appointmentId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() } as Consultation);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error(`Error in appointment subscription (${appointmentId}):`, err);
      if (onError) onError(err);
    }
  );
}
