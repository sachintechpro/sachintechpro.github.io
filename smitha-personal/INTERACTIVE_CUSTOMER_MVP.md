# Smitha — Interactive Customer Experience MVP

## Product objective

Customer curiosity → useful interaction → personal relevance → a takeaway → **optional direct discussion with Smitha**. There is no new dashboard, CRM, policy portal, or back-office workflow. Visitors can use the site without an account or submitting personal financial records.

Smitha handles introductions and relationship-building. With transparent consent, appropriately qualified upline producers or other specialists may help with detailed consultations, contract illustrations, applications, and professional follow-through. The static site does not access their systems.

## Customer experiences

The entry page is `experiences.html`. Each tool can be opened directly with `?tool=...`.

| Visitor journey | Example URL query | Actual interaction | Takeaway |
|---|---|---|---|
| Homeowner / estate | `?tool=estate` | Six status checks for financial/health decision-makers, beneficiaries, documents, property and instructions | Prioritized estate discussion questions (not legal scoring) |
| Trust preparation | `?tool=trust` | Home, accounts, beneficiaries, business interests, successor trustee | Categories to take to a California estate attorney; does not imply a trust is funded |
| Family future | `?tool=family` | Adjustable example starting savings, monthly contribution, years and hypothetical annual rate | Monthly-compounding illustration with contributed principal and hypothetical value; not a forecast |
| Caregiving | `?tool=care` | Wishes, medical and financial authority, daily support, and potential costs | Prioritized care-coordination questions |
| Medicare Part B | `?tool=medicare` | Broad age/coverage/active-employment/coverage-change selectors | Questions and official links; **no determination of enrollment eligibility or dates** |
| Retirement or business continuity | `?tool=continuity` | Retiree monthly expenses vs expected income OR business decision/operation backup | Illustrative monthly difference or a continuity checklist |

All results offer a related next tool and open the contact chooser. Visitors can also copy the discussion questions, open an SMS draft, or print/save the takeaway. No option sends a message automatically. Because SMS receipt is not verified, a draft **does not count as delivered**. Verified WhatsApp/Instagram/Facebook DM profiles remain unconfigured until Smitha approves exact URLs.

## Visitor-facing design boundaries

- **Never** expose project/deployment commentary, site-building details, test-case names, fake testimonials, vendor upline terminology, or a product sales catalogue.
- Keep first-person copy genuine but obtain Smitha's review and authorization before publication as her official business site.
- A living trust is **not mandatory**. Only qualified legal counsel should form and advise on trusts.
- Policy suitability, cash-value projections, investment results and coverage need properly qualified review; no guarantees are given here.
- Medicare enrollment timing may be urgent and depends on an individual's exact circumstances; direct visitors to Medicare and Social Security.
- Savings examples use straightforward monthly compounding and hypothetical inputs; no inflation, fees, taxes or market losses are modeled. They are not personalized planning recommendations.
- Do not request names, addresses, income records, medical details, policy numbers, account numbers or Social Security numbers through this interactive experience.
- All answers are held only in the active webpage while exploring. The `tool` URL parameter selects a category, not personal answers.

## Owner activation checklist

1. **Identity and consent:** Smitha reviews and approves exact name, titles, credentials, biography, first-person text and watercolor illustration.
2. **Professional claims:** verify licensing and scope of services with the applicable regulator; disclose relationships/compensation and approved communications as required.
3. **Contact destinations:** validate SMS receipt, owner-controlled email, WhatsApp, Messenger, Instagram, and appointment/calendar account; update `site-config.js` only with verified destinations.
4. **Booking:** the built-in calendar is a preferred-time **request**, not live availability; to confirm real bookings connect a verified provider.
5. **Referral process:** document how consent is obtained before sharing inquiry information with an upline producer or another expert.
6. **Privacy:** review the privacy notice for any live chat/AI provider, consent, or tracking service before activation.
7. **Acceptance:** test actual iPhone Safari, Android Chrome, keyboard navigation, reader announcements, physical-device phone and DM handoffs, provider booking confirmation, and official links. Do not mark these tests passed based solely on a mock-DOM exercise.
8. **Owner materials:** keep outreach templates and configuration separate from the public visitor journey. The existing `outreach-kit.html` is still accessible by direct URL and should be placed behind access controls for a genuine private owner area.

## Realistic acceptance journeys

- **New homeowner:** Home → estate readiness → mark property/beneficiaries unknown → customized questions → trust-preparation link → contact.
- **New parent:** Home → family future → change monthly amount and time horizon → compare hypothetical numbers and the no-growth contributed amount → estate questions for guardians/beneficiaries → share a takeaway.
- **Caregiving adult:** Caregiving article → older loved-one experience → identify legal authority and daily-support gaps → care guide → voluntary contact.
- **Approaching 65:** Medicare article → Part B timing experience → active employment/COBRA selection → official Medicare enrollment guidance before any unrelated estate tool.
- **Entrepreneur:** Business article → continuity scenario → identify backup-authority uncertainty and customer obligations → related estate questions → conversation.
- **Retiring professional:** Retirement article → income-vs-expense illustration → Medicare timing link → contact.
- **Visitor who only wants to talk:** Connect button → contact modal, without completing any tool or questions.

### Regression scope

Static source and JavaScript syntax checks, formula/response tests, and simulated contact handoff checks provide useful evidence, **not** confirmed real-browser acceptance or real lead conversions. Keep a separate acceptance record for verified phone, SMS, social DMs and calendaring.

### Reference information

- California Courts, wills, estates and advance planning: https://selfhelp.courts.ca.gov/wills-estates-probate/legal-documents
- Medicare, enrollment questions: https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-can-i-sign-up-for-medicare
- Investor.gov, compound-interest calculator: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
