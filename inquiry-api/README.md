# SachinTechpro portfolio inquiry service

The inquiry form uses a real email confirmation link, then a real Twilio-delivered mobile code that the service checks before accepting the inquiry. It does not accept demo codes or simulate provider success. If a provider is missing or rejects a request, the visitor sees an error and cannot advance through that verification step. Inquiry records and message history are not persisted; short-lived verification attempts live in process memory.

## Private Render environment variables

Set these in the `sachintechpro-inquiries` service settings. Keep all credentials private and out of GitHub.

Required for email confirmation and inquiry delivery:

- `SMTP_HOST`
- `SMTP_PORT` (usually `587`)
- `SMTP_USER` (the authorized sender address; defaults in code to `Sachin.techpro@gmail.com`)
- `SMTP_PASSWORD`
- `INQUIRY_TO` (defaults to `Sachin.techpro@gmail.com`)
- `VERIFY_SECRET` (a random secret with at least 32 characters)

Required for actual SMS verification:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (SMS-capable number in E.164 format)

Optional follow-up messages, sent only after the visitor opts in:

- `TWILIO_WHATSAPP_FROM` (WhatsApp-enabled Twilio sender, formatted as `whatsapp:+...`)
- `TWILIO_WHATSAPP_CONTENT_SID` (approved WhatsApp template; variables `{{1}}` first name and `{{2}}` inquiry type)

## Service

- Intended Render service: `sachintechpro-inquiries`
- Start command: `python inquiry-api/server.py`
- Health check: `GET /health`
- Allowed browser origin: `https://sachintechpro.github.io`
- Public website API: `https://sachintechpro-inquiries.onrender.com`

Emails use the display name `SachinTechpro` and the configured SMTP sender address. The mail provider must authorize that address. Verification links expire after 20 minutes; the one-time SMS code expires after 10 minutes and is limited to five attempts. The inquiry notification and personalized receipt are sent only after both verifications pass. Optional SMS and WhatsApp follow-ups require explicit consent.

The service uses per-process rate limits and in-memory verification state. It runs as a single service instance; multiple instances would need shared state and distributed rate limiting.
