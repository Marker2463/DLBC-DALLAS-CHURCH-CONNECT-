const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add imports
if (!content.includes('import admin from')) {
  content = content.replace('import dotenv from "dotenv";', 
    `import dotenv from "dotenv";
import admin from "firebase-admin";
import { createZoomMeeting } from "./src/lib/zoom.js";
import { createGoogleMeetEvent } from "./src/lib/googleMeet.js";`
  );
}

// Replace the endpoint logic
const newEndpoint = `
  app.post("/api/consultations/join", async (req, res) => {
    try {
      const { consultationId } = req.body;
      if (!consultationId) {
        return res.status(400).json({ error: 'Missing consultationId' });
      }

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
        meetingLink = await createZoomMeeting({
          topic: \`Pastoral Consultation — \${data.category || 'General'}\`,
          startTimeIso: data.scheduledStart || data.scheduledAt,
          durationMinutes: 45,
        });
      } else if (data.meetingMethod === 'google_meet' || !data.meetingMethod) {
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

      return res.json({ method: data.meetingMethod || 'google_meet', meetingLink });
    } catch (error) {
      console.error('Failed to resolve join request:', error);
      return res.status(500).json({ error: 'Unable to start the session. Please try again.' });
    }
  });
`;

content = content.replace(/app\.post\("\/api\/consultations\/join", async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Unable to start the session\. Please try again\.' \}\);\n    \}\n  \}\);/, newEndpoint);

fs.writeFileSync('server.ts', content);
