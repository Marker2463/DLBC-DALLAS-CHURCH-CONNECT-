const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace the /api/calendar/create-event block with /api/consultations/join
const newEndpoint = `
  app.post("/api/consultations/join", async (req, res) => {
    try {
      const { consultationId } = req.body;
      if (!consultationId) {
        return res.status(400).json({ error: 'Missing consultationId' });
      }

      // We'll use dynamic import for firebase-admin to avoid top-level issues, or just require it
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: "dlbc-dallas-church-connect",
          credential: admin.credential.applicationDefault()
        });
      }
      
      const firestore = admin.firestore();
      firestore.settings({ databaseId: "ai-studio-dlbcchurchconnec-d51b846f-e39f-40ba-8929-2e22d9a82610" });
      const docRef = firestore.collection('consultations').doc(consultationId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({ error: 'Consultation not found' });
      }

      const data = snapshot.data();

      if (data.meetingMethod === 'in_person') {
        return res.json({
          method: 'in_person',
          location: data.meetingLocation || 'Location to be confirmed with your leader.',
        });
      }

      if (data.meetingLink && data.meetingLinkStatus === 'active') {
        return res.json({ method: data.meetingMethod, meetingLink: data.meetingLink });
      }

      const scheduledTime = new Date(data.scheduledStart || data.scheduledAt).getTime();
      const now = Date.now();
      const JOIN_WINDOW_BEFORE_MS = 5 * 60 * 1000;
      const JOIN_WINDOW_AFTER_MS = 60 * 60 * 1000;
      
      const windowStart = scheduledTime - JOIN_WINDOW_BEFORE_MS;
      const windowEnd = scheduledTime + JOIN_WINDOW_AFTER_MS;

      if (now < windowStart) {
        return res.status(403).json({ error: 'This room unlocks 5 minutes before your scheduled time.' });
      }

      if (now > windowEnd) {
        await docRef.update({ meetingLinkStatus: 'expired' });
        return res.status(403).json({ error: 'This consultation window has expired.' });
      }

      let meetingLink;

      if (data.meetingMethod === 'zoom') {
        const { createZoomMeeting } = await import('./src/lib/zoom.js');
        meetingLink = await createZoomMeeting({
          topic: \`Pastoral Consultation — \${data.category || 'General'}\`,
          startTimeIso: data.scheduledStart || data.scheduledAt,
          durationMinutes: 45,
        });
      } else if (data.meetingMethod === 'google_meet') {
        const { createGoogleMeetEvent } = await import('./src/lib/googleMeet.js');
        meetingLink = await createGoogleMeetEvent({
          consultationId,
          summary: \`Pastoral Consultation — \${data.category || 'General'}\`,
          startTimeIso: data.scheduledStart || data.scheduledAt,
          durationMinutes: 45,
        });
      } else {
        return res.status(500).json({ error: 'Unknown meeting method on this consultation.' });
      }

      await docRef.update({
        meetingLink,
        meetingLinkStatus: 'active',
        status: 'in-progress',
      });

      return res.json({ method: data.meetingMethod, meetingLink });
    } catch (error) {
      console.error('Failed to resolve join request:', error);
      return res.status(500).json({ error: 'Unable to start the session. Please try again.' });
    }
  });
`;

content = content.replace(/\/\/ API route to create Google Calendar Event[\s\S]*?res\.status\(500\)\.json\(\{ error: error\?\.message \|\| 'Failed to generate Google Meet room' \}\);\n    \}\n  \}\);/, newEndpoint);

fs.writeFileSync('server.ts', content);
