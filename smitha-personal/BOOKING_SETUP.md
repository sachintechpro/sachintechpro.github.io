# Smitha — 15-minute introduction call scheduling

## Visitor experience

- **Contact page:** https://hello-smitha-personal.onrender.com/contact.html
- **Book a time:** https://hello-smitha-personal.onrender.com/contact.html#smithaContactCalendar
- The quick **Let's connect** panel on every public page has four primary actions: **Email, Text, Call, Book 15 minutes**. WhatsApp, Instagram and Facebook Messenger remain available as separate social choices.
- The calendar displays weekdays and proposed start times in **America/Los_Angeles**. It offers a 15-minute introductory call but is **not** a real-time availability calendar. Visitors can select a preferred day and time and prepare an email or text request, or copy the message.
- A proposed time is **not booked or held**. It becomes an appointment only after Smitha confirms, or after the visitor completes the process with a verified live booking provider.

## Owner setup

Edit `site-config.js`:

```js
contact: {
  email: { address: "", verified: false },
  phone: { e164: "+18186264474", verifiedForVoice: true, verifiedForSms: false, smsDraftEnabled: true },
  booking: { url: "", verified: false }
},
introductionCall: {
  durationMinutes: 15,
  timezone: "America/Los_Angeles",
  weekdayStarts: [1,2,3,4,5],   // proposed request days, not real availability
  earliestHour: 9,
  latestStartHour: 16,
  intervalMinutes: 30,
  daysAheadMinimum: 1,
  daysAheadMaximum: 60,
  mode: "request-only"
}
```

The placeholders above are not substitute recipients or accounts. Activate **email** only after Smitha supplies and confirms her address. If unverified, Email offers to request the address through a text draft; it does **not** silently route to a guessed inbox. SMS is a device-generated draft and actual message receipt has not yet been confirmed.

For actual **confirmed appointments**, Smitha needs an approved service (e.g., Calendly, Cal.com or a supported booking service). Configure that service for a real 15-minute meeting, time zone, buffer rules, lead notice/consent, confirmation emails, and calendar conflicts. Put its verified public booking URL in `contact.booking.url` and set `verified:true`. The site then offers a **live booking calendar link** alongside the preferred-time request UI. The local preference selection does not reserve or transfer a slot to the provider. An authenticated booking API with conflict checks, confirmation and cancellation handling would be required to make the inline calendar itself a confirmed booking engine.

## Contact and privacy

- Customer-facing pages do not display Smitha's phone digits; `tel:` and `sms:` links still contain inspectable destination numbers.
- No visitor accounts or server-side appointment records are created. The user's preferred date and time are used only to compose an on-device message or email.
- Time selections are shown in Pacific time. No availability claims are made.
- No email or text is sent automatically. Do not ask for Social Security numbers, policy IDs, or sensitive personal/medical information.
- Keep first-person branding, professional services and compliance wording pending Smitha's approval.

## Regression matrix (source and deterministic interaction checks)

| Scenario | Required result |
|---|---|
| Contact from homepage hero | Opens `contact.html#smithaContactCalendar` |
| Contact from nav/footer | Opens `contact.html` |
| Contact on a guide | Four quick contact options plus calendar in the dialog |
| Mobile default | Calendar hidden in dialog until Book is selected |
| Weekend, past or out-of-window date | Not selectable |
| Pick valid date | 15-minute call start-time choices become enabled |
| Pick time | Summary shows weekday, date, time, Pacific timezone and explicit need for Smitha's confirmation |
| Change date | Previous preferred time clears |
| Request by text | Native SMS draft contains date, time and confirmation question, no auto-send |
| Email verified | Native mail draft includes preferred date and time |
| Email not verified | Text draft requests her email while retaining the selected date/time |
| Booking provider verified | External live booking link appears; user must complete confirmation there |
| Booking provider unverified | No fake availability or confirmation |
| Real DM platforms unverified | Do not invent identities or route visitors elsewhere |

**QA boundary:** tests of the HTML/JS and scripted interaction harness are not confirmation of delivery, calendar provider availability, or iPhone/Android physical-device behavior. The actual site must be accepted by Smitha before being used as her public business website.
