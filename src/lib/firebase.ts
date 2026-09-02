import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "dlbc-dallas-church-connect",
  appId: "1:571793135981:web:59ea0ffd2bc3915f5e6264",
  apiKey: "AIzaSyD_qDevRG_VtrBh1anEAWRVWgPLtlG9qhg",
  authDomain: "dlbc-dallas-church-connect.firebaseapp.com",
  storageBucket: "dlbc-dallas-church-connect.firebasestorage.app",
  messagingSenderId: "571793135981",
  measurementId: "",
};

export const app = initializeApp(firebaseConfig);
const databaseId = "ai-studio-dlbcchurchconnec-d51b846f-e39f-40ba-8929-2e22d9a82610";
export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

// Helper types
export type UserRole = 'member' | 'leader' | 'pastor' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  leaderType?: 'youth' | 'children' | 'pastoral' | null;
  membershipId?: string;
  memberSince?: string;
  photoURL?: string;
}

export interface Appointment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  pastorId: string;
  pastorName: string;
  scheduledAt: string; // ISO 8601 string
  durationMinutes: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetUrl?: string; // Central shared Google Meet URL
  calendarEventId?: string; // Shared Google Calendar Event ID
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  leaderId: string | null;
  leaderName: string | null;
  leaderEmail?: string | null;
  category: string;
  urgency: string;
  reason: string;
  attachments: string[];
  selectedTime: string | null; // ISO string
  scheduledStart?: string | null; // ISO string
  scheduledEnd?: string | null; // ISO string
  meetingMethod?: 'zoom' | 'google_meet' | 'in_person';
  meetingLocation?: string | null;
  meetingLinkStatus?: 'pending' | 'active' | 'expired';
  meetingLink?: string | null; // Real generated Meet link
  status: 'submitted' | 'under_review' | 'scheduled' | 'completed' | 'archived';
  isLocked: boolean;
  googleMeetUrl?: string | null;
  googleEventId?: string | null;
  meetUrl?: string | null; // Central shared Google Meet URL
  calendarEventId?: string | null; // Shared Google Calendar Event ID
  createdAt?: string | null;
  updatedAt?: string | null;
  journeyTimeline: { status: string; timestamp: string; description: string }[];
}

export interface ConsultationNote {
  id: string;
  consultationId: string;
  authorId: string;
  authorRole: string;
  content: string;
  createdAt: string; // ISO string
}

export interface LeaderAvailability {
  leaderId: string;
  weeklySchedule: {
    [dayOfWeek: string]: { 
      enabled: boolean; 
      slots: string[]; 
    };
  };
  blackoutDates: string[];
}
