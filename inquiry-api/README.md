# SachinTechpro portfolio inquiry service

The public contact flow is in **demo mode** for now. Email and mobile verification are simulated in the browser; the API also defaults to returning mock success responses. No emails, SMS, or WhatsApp messages are sent, and inquiry details are not stored.

## Intended live email identity

When real delivery is enabled, use:

- Sender display name: `SachinTechpro`
- Sender address: `Sachin.techpro@gmail.com`
- Inquiry notification destination: `Sachin.techpro@gmail.com`

The SMTP provider must authorize `Sachin.techpro@gmail.com` to send mail. Verification emails will go to the visitor’s address; inquiry notifications and receipts use the sender identity above.

## Switching to live delivery later

Set `DEMO_MODE=false` only after configuring the service’s private Render environment:

Required for email confirmation and inquiry delivery:

- `SMTP_HOST`
- `SMTP_PORT` (usually `587`)
- `SMTP_USER=Sachin.techpro@gmail.com`
- `SMTP_PASSWORD`
- `INQUIRY_TO=Sachin.techpro@gmail.com`
- `VERIFY_SECRET` (random secret with at least 32 characters)

Required for mobile verification:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (SMS-capable number in E.164 format)

Optional WhatsApp follow-up:

- `TWILIO_WHATSAPP_FROM` (WhatsApp-enabled Twilio sender, formatted as `whatsapp:+...`)
- `TWILIO_WHATSAPP_CONTENT_SID` (approved WhatsApp message template, with variables `{{1}}` for first name and `{{2}}` for inquiry type)

WhatsApp follow-up is sent only after explicit visitor opt-in and requires an approved template. SMS follow-up is also opt-in; the one-time verification text is sent only after the visitor requests a code. SMS messages begin with `SachinTechpro`, while recipients may see the configured Twilio number as the sender.

## Service details

- Intended Render service: `sachintechpro-inquiries`
- Start command: `python inquiry-api/server.py`
- Health check: `GET /health`
- Allowed browser origin: `https://sachintechpro.github.io`

The verification link expires after 20 minutes; mobile codes expire after 10 minutes. The service uses per-process rate limits and short-lived verification state. Before scaling to multiple instances, use a persistent store and distributed rate limiting.
