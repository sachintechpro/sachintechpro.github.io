# Smitha — private contact channels and account ownership

## Status

This is a personalized preview awaiting Smitha's approval. The live website should **not** assert that an unrelated social profile belongs to Smitha based only on a shared name.

The available profile details do not establish ownership of any Instagram, Facebook, WhatsApp, LinkedIn, X, or TikTok account. Keep those channels **unverified** until Smitha confirms the exact links.

## Configure channels

Edit `site-config.js`, then commit to the personal-demo branch. Test each destination from a phone in both logged-in and logged-out states.

| Channel | Configuration | Expected URL | Status |
|---|---|---|---|
| Call | `contact.phone.e164` and `verifiedForVoice` | `tel:+1...` | Enabled using number supplied on card |
| Text | `contact.phone.smsDraftEnabled=true` | `sms:+1...&body=...` on iPhone | Draft enabled; receipt not verified |
| WhatsApp | `contact.whatsapp.url`, `verified:true` | `https://wa.me/<confirmed_number>` | Pending account ownership confirmation |
| Instagram | `contact.instagram.url`, `verified:true` | Prefer `https://ig.me/m/<confirmed_handle>` | Pending |
| Facebook Messenger | `contact.facebook.url`, `verified:true` | `https://m.me/<confirmed_page>` | Pending |
| Email | `contact.email.address`, `verified:true` | `mailto:` | Pending |
| Booking | `contact.booking.url`, `verified:true` | Approved calendar URL | Pending |
| LinkedIn, X, TikTok | Matching `contact.<platform>.url`, `verified:true` | Owned HTTPS profile | Pending |

The personal site shows Call and Text as immediate options. WhatsApp, Instagram, and Facebook Messenger also appear as **explicitly pending** choices; until an account is confirmed, selecting one prepares a text asking Smitha for the correct profile rather than routing to an invented or unrelated account. They become direct links only when verified profile URLs are present.

For SMS, `smsDraftEnabled` means only that visitors may open their own messaging app. `verifiedForSms` should become true **only after a real device sends a test message and Smitha confirms receipt**. The UI continues to disclose unconfirmed delivery until then. The site does not send an SMS automatically.

## Privacy distinction

Visible phone digits have been removed from customer-facing page copy, modal cards, chat answers, shared handouts, and email signatures. Tap-to-call and text links still contain a phone endpoint that can be inspected in the browser source. A static website **cannot make a destination phone number genuinely secret** while placing a direct `tel:` or `sms:` call. A relay or messaging service would be required for true number masking.

No automatic lead, DM, call, or appointment confirmation is reported by the app.

## Profile and professional verification

1. Smitha confirms that she owns each profile or phone account.
2. Open the profile on a signed-in and a signed-out device; confirm name, image, current business description, and that the DM route addresses the intended account.
3. Record Smitha's approval before marking `verified:true`.
4. Check professional credentials through the appropriate regulator and confirm how Smitha is permitted to describe her services. If she sells insurance, California DOI: https://www.insurance.ca.gov/license-status/index.cfm
5. Obtain approval of first-person public content before connecting a client domain.
