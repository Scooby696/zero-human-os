import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const participantName = user?.full_name || 'ZHS User';

    const response = await fetch('https://vocalbridgeai.com/api/v1/token', {
      method: 'POST',
      headers: {
        'X-API-Key': Deno.env.get('VOCAL_BRIDGE_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participant_name: participantName }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: 'Token fetch failed', details: err }, { status: 502 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});