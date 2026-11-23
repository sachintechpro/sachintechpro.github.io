# Smitha: private-contact redesign and regression results

## Purpose
Make initiating a private conversation easy while keeping Smitha's phone digits out of visible website copy. This remains an independent client-review preview; it does not imply Smitha approved this website.

## Actual visitor experience
- Compact mobile contact chooser with watercolor avatar and short introduction.
- Five prominent choices: **Call**, **Text**, **WhatsApp**, **Instagram**, **Facebook Messenger**.
- Call opens the device's phone app without displaying digits.
- Text opens a draft in the device's SMS app. Because SMS receipt has not been confirmed, the UI explicitly says delivery is unverified.
- Verified WhatsApp/Instagram/Facebook links will open the correct account directly once Smitha provides and approves URLs.
- Until an account is verified, the choice clearly says **Ask for verified link by text** and prepares a message asking Smitha for that platform, rather than opening a fabricated account.
- Optional STAR introduction is collapsed by default; no typing is required to choose a channel.
- Verified email, calendar, LinkedIn, X, and TikTok can be added from the same configuration.
- Public page copy, help replies, emailed templates and shareable handouts link visitors to the private contact experience rather than printing the business-card number.

## Automated checks performed
- All **23 HTML page templates** checked for visible phone-number text; **0** occurrences found.
- New contact script plus config/shared/enhancement JS compiled successfully.
- Mock-DOM tests of three channel configurations: SMS draft enabled; SMS not enabled; verified Facebook Messenger link.
- All five channel choices render and the optional note is under a collapsed `details` element.
- Call launches the configured `tel:` URL, Text launches the configured iPhone `sms:` draft, and unverified WhatsApp/Instagram/Facebook never route to guessed accounts.
- Seven URL-validation cases checked: verified wa.me, ig.me, m.me accepted; unverified, non-HTTPS, mismatched and deceptive domains rejected.
- Browser-visible contact number masked in scripted UI tests.
- Render website and API deployment status: live on the updated branch.

## Profiles and professional credentials
The public profile search did **not** establish an authenticated Facebook, Instagram, WhatsApp or LinkedIn account for the same Los Angeles financial professional on Smitha's card. Search results for similarly named people do not establish account ownership. Do not link those profiles without Smitha confirming the accounts.

Review the official California Department of Insurance producer check as applicable: https://www.insurance.ca.gov/license-status/index.cfm

See `CONTACT_CHANNELS_SETUP.md` for the exact config and verification steps.

## Production acceptance still needed
1. Verify that Smitha controls the voice/SMS phone endpoint and receives a test message.
2. Obtain and test her genuine WhatsApp, Facebook, Instagram and other public profile links.
3. Confirm her professional title, credentials, authorized services and any legally required license displays.
4. Test in physical iPhone Safari, Android Chrome, and with assistive technology.
5. Confirm the content and watercolor likeness with Smitha before using it on her own domain.
6. For *true* phone-number secrecy, provide a proxy/relay: `tel:` and `sms:` URI destinations are inspectable despite being hidden visually.
7. No automatic confirmed lead delivery or appointment booking is claimed. The visitor must complete the interaction in the chosen external app.

The integration tests are source-level plus mock-DOM checks, **not** confirmed message receipt or external browser automation.
