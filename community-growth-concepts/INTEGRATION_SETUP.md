# Hello, Nisha — private contact integrations

This is a concept preview, drafted in Nisha's voice; it is not an approved or official agency site.

## Active from the supplied business card
- Email: `nrawal@farmersagent.com` opens a draft on the visitor's device. The visitor must send it.
- Call: `+1 818-206-4600` opens the phone dialer; this cannot promise a live answer.
- Text: `+1 818-206-3016` opens an SMS draft. Confirm the number accepts business text messages before real use.
- Find a time: opens an email requesting a friendly, no-sales conversation. **No booking is made.**

## Add channels when Nisha provides and approves them
At the top of the contact JavaScript embedded in each HTML page, locate the `CONTACT` configuration. Add the verified values for:

| Key | What to provide |
| --- | --- |
| `whatsappNumber` | Verified WhatsApp Business number with country code, digits only; must support direct chat. |
| `linkedin` | Profile URL or verified direct-contact destination. |
| `facebook` | Verified business/page/messenger URL. |
| `instagram` | Verified account/message destination. |
| `x` | Verified X account/contact URL. |
| `tiktok` | Verified TikTok account/contact URL. |
| `bookingUrl` | Live Calendly, Google Calendar appointment scheduling, Cal.com, or other legitimate booking link. |

These channels show as **Not linked** until configured. The prototype does not guess usernames or invent links. Social destinations normally open the profile rather than guarantee a direct message. Visitors can copy their optional STAR note and paste it into the selected service.

## The STAR conversation note
Situation — what brings the visitor here; Task — what they want help thinking through; Action — what they want to explore; Result — what a useful outcome would be. Optional preferred time and first name.

The note is assembled in the browser. It does not leave the page until the visitor deliberately opens email or messaging. There is no auto-submission, server lead database, appointment confirmation, automatic follow-up, or conversion analytics.

## Before production
- Have Nisha approve the content, identity, channels, business messaging, and the watercolor avatar.
- Confirm texting and WhatsApp/business-account authorization.
- Add a secure, consent-based contact submission endpoint if reliable lead capture and confirmation are needed.
- Add spam prevention, logging access controls, privacy notice, retention and deletion policies, and applicable insurance advertising checks.
- Never collect policy numbers, medical data, Social Security numbers, or sensitive financial information in the public STAR note.