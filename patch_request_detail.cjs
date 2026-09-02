const fs = require('fs');

let content = fs.readFileSync('src/pages/member/RequestDetail.tsx', 'utf8');

const newSubmit = `
  const handleFinalSubmit = async () => {
    if (!consultation || !id || !user) return;
    setIsSubmitting(true);
    
    try {
      let googleMeetUrl = null;
      let googleEventId = null;

      if (consultation.meetingMethod === 'google_meet' || consultation.meetingMethod === 'in_person') {
        const response = await fetch('/api/calendar/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId: id,
            title: \`Pastoral Consultation — \${consultation.category}\`,
            memberEmail: user.email,
            leaderEmail: consultation.leaderEmail,
            selectedTime: consultation.selectedTime || consultation.scheduledStart,
            method: consultation.meetingMethod
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.googleMeetUrl) googleMeetUrl = data.googleMeetUrl;
          if (data.eventId) googleEventId = data.eventId;
        }
      }

      const timeline = [...(consultation.journeyTimeline || [])];
      timeline.push({
        status: 'Meeting Scheduled',
        timestamp: new Date().toISOString(),
        description: 'Your meeting is scheduled. Calendar invites and reminders have been sent.'
      });

      await updateDoc(doc(db, 'consultations', id), {
        status: 'scheduled',
        isLocked: true,
        googleMeetUrl,
        googleEventId,
        meetingLink: googleMeetUrl,
        journeyTimeline: timeline
      });

      navigate('/member/sanctuary');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
`;

content = content.replace(/const handleFinalSubmit = async \(\) => \{[\s\S]*?navigate\('\/member\/sanctuary'\);\n    \} catch \(err\) \{\n      console.error\(err\);\n    \} finally \{\n      setIsSubmitting\(false\);\n    \}\n  \};/, newSubmit);
fs.writeFileSync('src/pages/member/RequestDetail.tsx', content);
