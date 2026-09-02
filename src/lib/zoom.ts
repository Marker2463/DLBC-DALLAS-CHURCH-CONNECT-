interface CreateZoomMeetingArgs {
  topic: string;
  startTimeIso: string;
  durationMinutes: number;
}

async function getZoomAccessToken(): Promise<string> {
  const basicAuth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${basicAuth}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Zoom OAuth token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function createZoomMeeting({
  topic,
  startTimeIso,
  durationMinutes,
}: CreateZoomMeetingArgs): Promise<string> {
  const accessToken = await getZoomAccessToken();

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // scheduled meeting
      start_time: startTimeIso,
      duration: durationMinutes,
      timezone: 'America/Chicago',
      settings: {
        join_before_host: true,
        waiting_room: false,
        approval_type: 2,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Zoom meeting creation failed: ${res.status} ${errBody}`);
  }

  const data = await res.json();
  return data.join_url;
}
