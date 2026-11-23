# SachinTechpro portfolio inquiry service

A privacy-minded inquiry flow with email confirmation, mobile verification, and a verified inquiry notification. The service does not persist inquiry records or message history; it holds short-lived verification attempts in process memory.

## Render environment

Keep all values private in the service’s Render environment settings. Do not commit credentials.

Required for email verification and inquiry delivery:

- `SMTP_HOST`
- `SMTP_PORT` (usually `587`)
- `SMTP_USER` (an address authorized to send through the provider)
- `SMTP_PASSWORD`
- `INQUIRY_TO` (private recipient address)
- `VERIFY_SECRET` (random secret with at least 32 characters)

Required for mobile verification:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (SMS-capable number in E.164 format)

Optional WhatsApp follow-up:

- `TWILIO_WHATSAPP_FROM` (WhatsApp-enabled Twilio sender, formatted as `whatsapp:+...`)
- `TWILIO_WHATSAPP_CONTENT_SID` (approved WhatsApp message template, with variables `{{1}}` for first name and `{{2}}` for inquiry type)

WhatsApp follow-up is sent only when the visitor explicitly opts in. Twilio requires an approved template for business-initiated WhatsApp messages. SMS follow-up is also opt-in. The one-time verification SMS is sent only after the visitor enters a number and requests a code.

## Service

- Intended Render service: `sachintechpro-inquiries`
- Start command: `python inquiry-api/server.py`
- Health check: `GET /health`
- Browser origin allowed: `https://sachintechpro.github.io`

The sender display name is `SachinTechpro`; the underlying SMTP address must be authorized by the email provider. The verification link expires after 20 minutes; SMS codes expire after 10 minutes. The inquiry notification and personalized receipt are sent after both checks pass.

The public static website calls `https://sachintechpro-inquiries.onrender.com`. The Render service must be deployed and configured with the variables above before live verification can succeed. This lightweight service uses per-process rate limits and ephemeral verification state; use a persistent store and distributed rate limiting before scaling to multiple service instances.
