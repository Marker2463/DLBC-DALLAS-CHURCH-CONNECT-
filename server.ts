import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import dotenv from "dotenv";
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createZoomMeeting } from "./src/lib/zoom";
import { createGoogleMeetEvent } from "./src/lib/googleMeet";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware (Configured safely for AI Studio preview & iframe embedding)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/calendar/schedule", async (req, res) => {
    try {
      const { consultationId, title, memberEmail, leaderEmail, selectedTime, method } = req.body;
      if (!selectedTime || !memberEmail) {
        return res.status(400).json({ success: false, error: "Missing required appointment fields (selectedTime, memberEmail)." });
      }

      // Initialize admin Firestore if needed for read-first check
      if (!getApps().length) {
        try {
          initializeApp({
            projectId: "dlbc-dallas-church-connect",
            credential: applicationDefault()
          });
        } catch {
          initializeApp({ projectId: "dlbc-dallas-church-connect" });
        }
      }

      let docData: any = null;
      let docRef: any = null;
      if (consultationId) {
        try {
          const firestore = getFirestore();
          firestore.settings({ databaseId: "ai-studio-dlbcchurchconnec-d51b846f-e39f-40ba-8929-2e22d9a82610" });
          docRef = firestore.collection('consultations').doc(consultationId);
          const snap = await docRef.get();
          if (snap.exists) {
            docData = snap.data();
            const existingMeet = docData.meetUrl || docData.googleMeetUrl || docData.meetingLink;
            if (existingMeet && docData.calendarEventId) {
              return res.json({
                success: true,
                eventId: docData.calendarEventId || docData.googleEventId,
                googleMeetUrl: existingMeet,
                meetUrl: existingMeet,
                calendarEventId: docData.calendarEventId || docData.googleEventId,
              });
            }
          }
        } catch (dbErr) {
          console.warn("Read-first firestore check non-fatal error:", dbErr);
        }
      }

      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        return res.status(500).json({
          success: false,
          error: "Google Calendar service account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) are not configured."
        });
      }
      
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/calendar"]
      });
      const calendar = google.calendar({ version: "v3", auth });
      const startTime = new Date(selectedTime);
      const endTime = new Date(startTime.getTime() + 45 * 60000);
      
      const eventPayload: any = {
        summary: title || 'DLBC Pastoral Consultation',
        description: `Consultation ID: ${consultationId}\nConfidential pastoral care session.`,
        start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
        attendees: [{ email: memberEmail }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };
      
      if (leaderEmail) {
        eventPayload.attendees.push({ email: leaderEmail });
      }

      if (method === 'google_meet') {
        eventPayload.conferenceData = {
          createRequest: {
            requestId: `meet-${consultationId || Date.now()}-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        };
      }

      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        conferenceDataVersion: 1,
        sendUpdates: "all",
        requestBody: eventPayload,
      });

      const eventData = response.data;
      let meetUrl: string | null = null;
      if (method === 'google_meet') {
        meetUrl = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || null;
        if (!meetUrl) {
          return res.status(502).json({
            success: false,
            error: "Google Calendar event created, but no unique Google Meet video link was returned. Ensure Google Meet is enabled on the shared calendar."
          });
        }
      }

      if (docRef && meetUrl) {
        try {
          await docRef.update({
            meetUrl,
            googleMeetUrl: meetUrl,
            meetingLink: meetUrl,
            calendarEventId: eventData.id,
            googleEventId: eventData.id,
            updatedAt: new Date().toISOString()
          });
        } catch (updateErr) {
          console.warn("Firestore update in schedule route error:", updateErr);
        }
      }

      return res.json({
        success: true,
        eventId: eventData.id,
        calendarEventId: eventData.id,
        googleMeetUrl: meetUrl,
        meetUrl,
      });
    } catch (error: any) {
      console.error("Google Calendar Error:", error);
      const errMsg = error?.response?.data?.error?.message || error?.message || "Failed to schedule Google Calendar event.";
      return res.status(500).json({
        success: false,
        error: errMsg
      });
    }
  });

  app.put("/api/calendar/update", async (req, res) => {
    try {
      const { eventId, selectedTime } = req.body;
      if (!eventId || !selectedTime) {
        return res.status(400).json({ success: false, error: "Missing required fields (eventId, selectedTime)." });
      }

      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        return res.status(500).json({
          success: false,
          error: "Google Calendar service account credentials are not configured."
        });
      }
      
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/calendar"]
      });
      const calendar = google.calendar({ version: "v3", auth });
      const startTime = new Date(selectedTime);
      const endTime = new Date(startTime.getTime() + 45 * 60000);
      
      const response = await calendar.events.patch({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        eventId: eventId,
        sendUpdates: "all",
        requestBody: {
          start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
          end: { dateTime: endTime.toISOString(), timeZone: "UTC" }
        },
      });

      return res.json({ success: true, eventId: response.data.id });
    } catch (error: any) {
      console.error("Google Calendar Update Error:", error);
      const errMsg = error?.response?.data?.error?.message || error?.message || "Failed to update Google Calendar event.";
      return res.status(500).json({ success: false, error: errMsg });
    }
  });

  app.post("/api/consultations/join", async (req, res) => {
    try {
      const { consultationId } = req.body;
      if (!consultationId) {
        return res.status(400).json({ error: 'Missing consultationId' });
      }

      if (!getApps().length) {
        try {
          initializeApp({
            projectId: "dlbc-dallas-church-connect",
            credential: applicationDefault()
          });
        } catch {
          initializeApp({ projectId: "dlbc-dallas-church-connect" });
        }
      }
      
      const firestore = getFirestore();
      firestore.settings({ databaseId: "ai-studio-dlbcchurchconnec-d51b846f-e39f-40ba-8929-2e22d9a82610" });
      const docRef = firestore.collection('consultations').doc(consultationId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      const data = snapshot.data() || {};

      if (data.meetingMethod === 'in_person') {
        return res.json({
          method: 'in_person',
          location: data.meetingLocation || 'Location to be confirmed with your pastor.',
        });
      }

      const existingMeet = data.meetUrl || data.googleMeetUrl || data.meetingLink;
      if (existingMeet && data.meetingLinkStatus === 'active') {
        return res.json({ method: data.meetingMethod || 'google_meet', meetingLink: existingMeet, meetUrl: existingMeet });
      }

      let meetingLink = existingMeet;

      if (!meetingLink) {
        if (data.meetingMethod === 'zoom') {
          meetingLink = await createZoomMeeting({
            topic: `Pastoral Consultation — ${data.category || 'General'}`,
            startTimeIso: data.scheduledStart || data.selectedTime || new Date().toISOString(),
            durationMinutes: 45,
          });
        } else {
          meetingLink = await createGoogleMeetEvent({
            consultationId,
            summary: `Pastoral Consultation — ${data.category || 'General'}`,
            startTimeIso: data.scheduledStart || data.selectedTime || new Date().toISOString(),
            durationMinutes: 45,
          });
        }
      }

      if (!meetingLink) {
        return res.status(400).json({
          error: 'No active video consultation link is available for this session.'
        });
      }

      await docRef.update({
        meetUrl: meetingLink,
        googleMeetUrl: meetingLink,
        meetingLink: meetingLink,
        meetingLinkStatus: 'active',
        status: 'scheduled',
        updatedAt: new Date().toISOString(),
      });

      return res.json({ method: data.meetingMethod || 'google_meet', meetingLink, meetUrl: meetingLink });
    } catch (error: any) {
      console.error('Failed to resolve join request:', error);
      return res.status(500).json({ 
        error: error?.message || 'Failed to initialize consultation video room.'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

