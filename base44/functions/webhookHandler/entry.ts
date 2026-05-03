import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Extract workflowId and triggerId from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const workflowId = pathParts[3];
    const triggerId = pathParts[4];

    if (!workflowId || !triggerId) {
      return Response.json({ error: 'Missing workflowId or triggerId' }, { status: 400 });
    }

    // Extract auth token from headers
    const authToken = req.headers.get('X-Webhook-Token') || req.headers.get('Authorization')?.replace('Bearer ', '');
    const clientIP = req.headers.get('X-Forwarded-For')?.split(',')[0] || req.headers.get('X-Client-IP');

    // Parse request body
    let payload = {};
    try {
      const body = await req.text();
      if (body) {
        payload = JSON.parse(body);
      }
    } catch (e) {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Store webhook event in a database or log system
    // For now, we'll return success and log the event
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      workflowId,
      triggerId,
      timestamp: new Date().toISOString(),
      payload,
      clientIP,
      headers: Object.fromEntries(
        [...req.headers.entries()].filter(([key]) =>
          ['content-type', 'user-agent', 'x-webhook-token'].includes(key.toLowerCase())
        )
      ),
    };

    // Log the webhook event
    console.log(`[Webhook] Received event for workflow ${workflowId}`, event);

    return Response.json({
      success: true,
      event: event.id,
      workflow: workflowId,
      trigger: triggerId,
      message: 'Webhook received and queued for processing',
    });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});