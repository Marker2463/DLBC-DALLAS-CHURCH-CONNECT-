import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, UserProfile, UserRole } from './firebase';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings'
];

export const MEET_SCOPES = GOOGLE_SCOPES;

const googleProvider = new GoogleAuthProvider();
GOOGLE_SCOPES.forEach(scope => googleProvider.addScope(scope));

// In-memory token cache (strictly not stored in localStorage or sessionStorage)
let inMemoryAccessToken: string | null = null;

export const getGoogleAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const setGoogleAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

/**
 * Sign in with Google and request Google Meet scopes
 */
export async function signInWithGoogle(desiredRole: UserRole = 'member'): Promise<{ user: User; profile: UserProfile; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    
    if (accessToken) {
      setGoogleAccessToken(accessToken);
    }

    const firebaseUser = result.user;
    const uid = firebaseUser.uid;
    const cleanEmail = firebaseUser.email?.toLowerCase().trim() || '';
    const isAdminEmail = cleanEmail === 'markeroladipo@gmail.com';

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    let profile: UserProfile;

    if (userDoc.exists()) {
      profile = userDoc.data() as UserProfile;
      if (isAdminEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
      }
    } else {
      const assignedRole: UserRole = isAdminEmail ? 'admin' : desiredRole;
      profile = {
        uid,
        displayName: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Member',
        email: cleanEmail,
        role: assignedRole,
        photoURL: firebaseUser.photoURL || undefined,
        memberSince: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
    }

    return { user: firebaseUser, profile, accessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export interface GoogleMeetSpaceResponse {
  name: string;
  meetingUri: string;
  meetingCode: string;
}

export async function createGoogleMeetSpace(accessToken?: string | null): Promise<GoogleMeetSpaceResponse> {
  const token = accessToken || getGoogleAccessToken();
  if (!token) {
    throw new Error('Google OAuth Access Token is missing. Re-authentication required.');
  }

  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      config: { accessType: 'OPEN' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Meet API provision failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  if (!data.meetingUri) {
    throw new Error('Google Meet API did not return a valid meetingUri payload.');
  }

  return {
    name: data.name || '',
    meetingUri: data.meetingUri,
    meetingCode: data.meetingCode || data.meetingUri.replace('https://meet.google.com/', '')
  };
}

export async function createGoogleCalendarEvent(eventData: {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  location?: string;
  accessToken?: string | null;
}): Promise<{ id: string; htmlLink: string; hangoutLink: string }> {
  const token = eventData.accessToken || getGoogleAccessToken();
  if (!token) {
    throw new Error('Google Calendar OAuth Access Token is missing.');
  }

  const payload = {
    summary: eventData.summary,
    description: eventData.description,
    start: {
      dateTime: eventData.startIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago'
    },
    end: {
      dateTime: eventData.endIso,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Chicago'
    },
    location: eventData.location,
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Calendar API Error (${response.status}): ${err}`);
  }

  const result = await response.json();
  const meetUrl = result.hangoutLink || result.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri;

  if (!meetUrl) {
    throw new Error('Calendar event created, but Google failed to assign a hangoutLink conference URI.');
  }

  return {
    id: result.id,
    htmlLink: result.htmlLink,
    hangoutLink: meetUrl
  };
}

