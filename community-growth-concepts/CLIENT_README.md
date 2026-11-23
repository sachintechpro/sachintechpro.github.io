# Hello, Nisha — personalized community concept (demo)

This project is an independently prepared, non-operational concept demonstration for Nisha Rawal. It is **not** an agency portal or an official, approved Farmers Insurance website. The watercolor portrait is an illustrative likeness, not a real photo.

## Live demonstration

- Home: https://hello-nisha-personal.onrender.com/
- A Few Good Questions: https://hello-nisha-personal.onrender.com/coverage.html
- Around Our Valley: https://hello-nisha-personal.onrender.com/valleycircle.html

All three pages are mobile-responsive, self-contained HTML. The avatar illustration is embedded; no separate image asset is required.

## What visitors can do

- Explore a friendly personal introduction in Nisha's illustrative voice.
- Answer a three-step educational insurance questionnaire and receive five tailored conversation questions. No insurance quote or recommendation is produced.
- Explore neighborhood-oriented guides and fictional examples of possible local collaborations.
- Open a private contact chooser with email, call, SMS, or a request to find a friendly no-sales conversation time.
- Optionally prepare a STAR conversation note (Situation, Task, Action, Result), copied locally or passed into an email/SMS draft.

## What is *not* connected

- No automatic message sending, server-side lead capture, or appointment confirmation.
- No verified WhatsApp, LinkedIn, Facebook, Instagram, X/Twitter, or TikTok profiles are configured; unconnected services are labeled.
- No real partner directory, live paid offers, quotes, policy systems, or customer records.
- “Ask Nisha” is a clearly labeled illustrated digital guide. Free-form AI replies require a configured provider API key and successful endpoint health check. Do not claim AI is active until verified.

## Technical deployment

The personalized demo is deployed from the isolated branch `demo/hello-nisha-personal-2026` in `sachintechpro/sachintechpro.github.io`. The existing production `main` branch and the separate generic demo branch are not changed by these updates. Render serves the three HTML files through a static-site build. Any future client production deployment should use a dedicated repository and an approved domain after Nisha consents.

## Quality verification

Browser tests ran in Chromium at 390px mobile and 1440px desktop widths for all three pages. Verified no horizontal overflow, visible illustration, opening/closing the contact modal, STAR note preview, and proper mailto, sms, tel and request-time handoff URLs. These are device handoffs: they do **not** prove that a recipient receives a message. Separate checks are required on real phones and for all future external integrations.

See `INTEGRATION_SETUP.md` for contact endpoints, privacy boundaries, and activation steps. Do not publish customer data, API keys, or internal integration secrets in this repository.
