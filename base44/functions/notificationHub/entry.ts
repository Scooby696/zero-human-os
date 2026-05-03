import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventType, subject, message, details } = await req.json();

    if (!eventType || !subject || !message) {
      return Response.json(
        { error: 'Missing required fields: eventType, subject, message' },
        { status: 400 }
      );
    }

    // Fetch user notification preferences
    const preferences = await base44.entities.NotificationPreference.filter({
      userId: user.id,
      eventType,
      isActive: true,
    });

    if (preferences.length === 0) {
      return Response.json({
        success: true,
        message: 'No notification preferences configured',
      });
    }

    const pref = preferences[0];
    const channels = [];
    const errors = [];

    // Send email notification
    if (pref.email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `[${eventType.toUpperCase()}] ${subject}`,
          body: formatEmailBody(subject, message, details),
        });
        channels.push('email');
      } catch (err) {
        errors.push(`Email: ${err.message}`);
      }
    }

    // Send Slack notification
    if (pref.slack && pref.slackWebhook) {
      try {
        const slackMessage = {
          text: subject,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${subject}*\n${message}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Event: ${eventType} | Time: ${new Date().toISOString()}`,
                },
              ],
            },
          ],
        };

        const slackRes = await fetch(pref.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        });

        if (!slackRes.ok) {
          throw new Error(`Slack API returned ${slackRes.status}`);
        }
        channels.push('slack');
      } catch (err) {
        errors.push(`Slack: ${err.message}`);
      }
    }

    // Send SMS notification (via Twilio)
    if (pref.sms && pref.phoneNumber) {
      try {
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!accountSid || !authToken || !fromNumber) {
          throw new Error('Twilio credentials not configured');
        }

        const smsRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: fromNumber,
              To: pref.phoneNumber,
              Body: `[${eventType.toUpperCase()}] ${subject}: ${message.substring(0, 140)}`,
            }).toString(),
          }
        );

        if (!smsRes.ok) {
          throw new Error(`Twilio returned ${smsRes.status}`);
        }
        channels.push('sms');
      } catch (err) {
        errors.push(`SMS: ${err.message}`);
      }
    }

    // Log the notification attempt
    const status = channels.length > 0 ? 'sent' : 'failed';
    const log = await base44.entities.NotificationLog.create({
      eventType,
      userId: user.id,
      channels: JSON.stringify(channels),
      subject,
      message,
      status,
      details: details ? JSON.stringify(details) : null,
      errorMessage: errors.length > 0 ? errors.join('; ') : null,
    });

    return Response.json({
      success: channels.length > 0,
      channels,
      logId: log.id,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function formatEmailBody(subject, message, details) {
  let body = `<h2>${subject}</h2>\n<p>${message}</p>`;

  if (details) {
    body += `\n<hr>\n<h4>Details:</h4>\n<pre>${JSON.stringify(details, null, 2)}</pre>`;
  }

  body += `\n<hr>\n<p style="font-size: 12px; color: #888;">
    This notification was sent to you because of your notification preferences.
    <a href="https://app.zerohumansystems.com/settings/notifications">Manage preferences</a>
  </p>`;

  return body;
}