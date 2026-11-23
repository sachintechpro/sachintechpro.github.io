# Hello, Nisha — lead collection status

**Operating mode: demonstration only.** Render publishes static HTML pages. Each has one expandable contact/subscription preview near the bottom. The preview forms validate locally, clear entered values, and display a clearly labeled simulation confirmation. No lead record, email, SMS, subscription, or calendar entry is created; the preview forms make **no network request**.

The separate AI digital guide **does make a network request** to its dedicated Render API when someone asks a question. This is different from lead capture. Visitors must not enter sensitive personal information. Direct `sms:`, `tel:` and `mailto:` links open the visitor's own device applications and can result in a genuine message only if the visitor chooses to send it.

## Current deployment

- Site: `hello-nisha-personal` — Render **Static Site**, branch `demo/hello-nisha-personal-2026`, publishes `index.html`, `coverage.html`, and `valleycircle.html`.
- Chat service: `hello-nisha-guide-api` — separate Render web service, same branch.
- Files `server.js`, `lead.js` and `package.json` under this project root are **dormant legacy prototypes** and are **not used by the current static deployment**. Do not assume those files deliver leads or provide live newsletter subscription.

## Production integration, only by separate approval

Before activation, confirm Nisha's agency permissions and appropriate insurance advertising requirements; set up an approved website/business email domain and phone number; implement secure form handling, opt-in and unsubscribe, abuse prevention, duplicate management, verified notifications through the chosen email/SMS providers, and a genuine scheduling system. Test both delivery channels and never simulate delivery success in production.

## Demo release checks

1. Home, Good Questions, and Our Valley load on desktop and narrow mobile.
2. Six homepage topic links map to the expected question-guide topics.
3. Each page can open/close the *single* digital guide; email scheduling is a draft only.
4. Footer mobile `+18182063016` and office `+18182064600` work as device handoffs.
5. Contact and newsletter previews require email/consent, display explicit simulation confirmation, and clear fields.
6. The page explains that chat questions go to an AI backend and should not contain sensitive data.
7. The independent demo, fictional partnerships, and licensing/authorization caveats remain visible.
