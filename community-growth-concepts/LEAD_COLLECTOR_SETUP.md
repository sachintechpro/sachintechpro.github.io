# Nisha lead collector — production setup
The HTML pages now contain a contact lead form and a newsletter **subscription request** form. The Node web server exposes POST /api/leads and sends both email (Resend) and text (Twilio) notifications server-to-server.

## Render service configuration
Deploy this directory as a **Node Web Service** (not a Render Static Site):
- Repository: sachintechpro/sachintechpro.github.io
- Branch: demo/hello-nisha-personal-2026
- Root directory: community-growth-concepts
- Build command: npm install
- Start command: npm start
- Health: /health
- Render sets PORT automatically.

Required secret environment variables (set in Render; **never commit values to GitHub**):
- RESEND_API_KEY — active Resend API key
- LEAD_FROM_EMAIL — verified sender e.g. "Nisha Website <leads@your-verified-domain>"
- NISHA_NOTIFY_EMAIL — Nisha's approved destination email
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_NUMBER — Twilio number authorized for outbound SMS (E.164)
- NISHA_NOTIFY_PHONE — Nisha's authorized text-message number (E.164)

Existing live service may need to be migrated from Static Site to a Web Service; updating a static build alone does not run server.js. Do not route production traffic to the form until both channels are configured and an end-to-end submission test confirms receipt.

## Form behavior and limitations
- Only the visitor's deliberate form submit sends a lead. Page visits, button clicks, and chat messages alone do not.
- Email is required; phone is optional. Subscription consent is separate from contact consent.
- The API never tells the visitor that both notifications succeeded unless both providers accepted their respective API requests.
- If one provider succeeds and the other fails, the response reports a partial-delivery warning; a user retry could cause a duplicate. Production deduplication and persistent retry queue require a durable database.
- This version does **not** store leads in its own database, manage newsletter membership, automatically send newsletters, verify visitor emails, confirm meetings, or implement unsubscribe processing. Notifications in Nisha's inbox are the current lead record.
- A newsletter form submits a subscription **request**, not an activated mailing-list membership. Use a mailing-list provider with consent records, double opt-in, and unsubscribe mechanisms before sending ongoing marketing emails.
- Limit and validate data, do not send policy numbers, SSNs, payment info, or other sensitive details.
- Use only an approved phone destination; verify compliance with Twilio sender registration and applicable messaging rules.
- GET /health reports booleans for email/sms configuration but never reveals credentials.

## Manual production UAT
1. Ensure GET /health shows both channels configured.
2. From Home, submit a contact inquiry and check Nisha receives both the Resend email and Twilio SMS.
3. On Coverage and Valley pages, repeat with another address and topic.
4. Submit a subscription request with affirmative consent; verify a distinct email and SMS.
5. Test missing consent, malformed email, empty inquiry message, and repeated requests.
6. Confirm browser displays a failure if secrets/provider configuration is missing.
7. Test 375px mobile Safari and 1440px desktop, keyboard access, and real phone messaging receipts.

Never use fabricated delivery success for production.
