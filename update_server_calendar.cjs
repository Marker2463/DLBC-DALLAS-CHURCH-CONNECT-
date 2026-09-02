const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const scheduleEndpoint = `
  app.post("/api/calendar/schedule", async (req, res) => {
    try {
      const { consultationId, title, memberEmail, leaderEmail, selectedTime, method } = req.body;
      if (!selectedTime || !memberEmail) {
        return res.status(400).json({ error: "Missing required event fields" });
      }
      
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
        scopes: ["https://www.googleapis.com/auth/calendar"],
        subject: process.env.GOOGLE_DELEGATED_ADMIN_EMAIL || 'markeroladipo@gmail.com'
      });
      const calendar = google.calendar({ version: "v3", auth });
      const startTime = new Date(selectedTime);
      const endTime = new Date(startTime.getTime() + 45 * 60000);
      
      const eventPayload = {
        summary: title || 'DLBC Pastoral Consultation',
        description: \`Consultation ID: \${consultationId}\\nConfidential pastoral care session.\`,
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
            requestId: \`dlbc-meet-\${consultationId}-\${Date.now()}\`,
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
      let meetUrl = null;
      if (method === 'google_meet') {
        meetUrl = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri;
      }

      res.json({
        success: true,
        eventId: eventData.id,
        googleMeetUrl: meetUrl,
      });
    } catch (error) {
      console.error("Google Calendar Error:", error);
      res.status(500).json({ error: 'Failed to schedule event' });
    }
  });

  app.put("/api/calendar/update", async (req, res) => {
    try {
      const { eventId, selectedTime } = req.body;
      if (!eventId || !selectedTime) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
        scopes: ["https://www.googleapis.com/auth/calendar"],
        subject: process.env.GOOGLE_DELEGATED_ADMIN_EMAIL || 'markeroladipo@gmail.com'
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

      res.json({ success: true, eventId: response.data.id });
    } catch (error) {
      console.error("Google Calendar Error:", error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });
`;

if (!server.includes('/api/calendar/schedule')) {
  server = server.replace('app.get("/api/health", (req, res) => {', scheduleEndpoint + '\n  app.get("/api/health", (req, res) => {');
}

fs.writeFileSync('server.ts', server);
