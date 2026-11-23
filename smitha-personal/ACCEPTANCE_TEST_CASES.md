# Smitha MVP — end-to-end acceptance cases
All people and scenarios below are **fictional**, for testing only. No third-party account, legal document or customer record should be created.

| # | Visitor story and entry point | Key path | Required real outcome |
|---|---|---|---|
| 1 | Maya bought a home and needs to identify decision-makers | index -> estate -> handouts?topic=estate -> Call/Text | Estate guide and print/share work; call uses owner-configured `tel:` number. SMS opens only when verified; otherwise a copyable note is offered |
| 2 | Dev asks if everyone must have a living trust | index -> trusts -> California legal resource -> CTA | Trust described as optional and attorney-managed, no guarantee of probate outcome |
| 3 | Priya and Daniel have a baby | my-path family -> children -> handouts?topic=children -> call or verified text | Guardianship, beneficiary and savings questions; no personal data collected |
| 4 | Elena is helping her older mother | caregiving -> relevant Medicare official resource -> chat -> contact | Direct next step after reading and safe privacy language |
| 5 | Robert is still employed approaching 65 | medicare -> official enrollment resource -> handouts?topic=retirement -> call | Does not invent enrollment eligibility or premium; warns that timing is situation-specific |
| 6 | Amir owns a growing small business | business -> handouts?topic=business -> call or verified text | Practical continuity questions and no invented partner agreements |
| 7 | Newlyweds review responsibilities | marriage -> estate -> trusts -> call | Seamless cross-topic navigation without forcing a product |
| 8 | After a local seminar Smitha wants to follow up | outreach-kit -> after-event template -> customize -> copy/open mail | Warm educational draft; no automatic sending or recipient list upload |
| 9 | Someone needs one printable resource | handouts -> select trusts -> print -> native share | Only selected takeaway is printable; current share URL preserves selected topic |
| 10 | Visitor prefers Instagram or Facebook | contact panel with only test configuration | No fake DM link; verified URL in config is required before clickable CTA appears |
| 11 | Visitor arrives from a shared estate email on iPhone | estate landing -> mobile quick-action Call/Copy note/Ask/Connect | All four mobile actions visible; Ask opens digital guide, with no overlap with contact options |
| 12 | Visitor has sensitive account info | chat and contact | Context explicitly discourages entering Social Security, Medicare or account numbers |
| 13 | Visitor wants to schedule immediately | Find a time | With verified booking URL, scheduling opens calendar; otherwise choose verified text or a call. Never claim a reserved time without provider confirmation |
| 14 | Visitor wants a useful first conversation | any life-stage guide -> Answer relevant questions -> situation, concern, prior effort, desired next outcome -> Text / Email / Book / Call Smitha | Topic-aware questions, no public framework labels, answers carried to user-initiated message, no server storage |
| 15 | Client owner wants to configure DMs | edit site-config.js -> verified URL -> deploy | Only verified real HTTPS URLs activate. Test examples never activate. |
| 16 | Visitor uses print on resources | printable takeaway | Body text and source links fit page; interactive site chrome hidden in print |
| 17 | Prospect wants to understand policy value | long-term-protection -> official California DOI -> Call | Explains guarantees, loans, lapses/fees without making promises |
| 18 | Generic search or topic browsing | explore -> filter and open guide -> contextual CTA | No dead end for an unfamiliar topic |
| 19 | Source control change | GitHub isolated branch -> Render | Main portfolio and Nisha's demo are unchanged |
| 20 | Smitha asks for trust formation | estate/trust pages | Explicit referral to qualified California estate attorney; no DIY legal-document generation |

## Browser smoke test notes
Run browser layout and keyboard acceptance at 390px and 1440px; then verify the device-native `tel:`, `sms:`, print, share and clipboard behavior on an iPhone/Android or desktop with supported applications. Browser navigation can be tested without sending actual messages. No end-to-end delivery or AI functionality should be claimed without real credentials and an acceptance receipt.

## Regression checks after surgical fixes (source and deterministic component tests)

- All 20 combinations in Find My Path produce three distinct, relevant guides; Medicare and caregiving urgent situations are prioritized correctly.
- All 15 topic pages contain five distinct, question-specific explanations; 23 HTML pages retain the contact modal and digital guide launcher.
- 471 static internal HTML links were checked against the known page set without missing targets (dynamic paths tested separately).
- Configured phone overrides the original number in call and SMS handoffs, visible links, outreach signatures, and copied handouts.
- Unverified SMS is disabled; confirmed SMS or booking URLs activate conditionally. The mobile action bar exposes Call, Copy/Text, Ask, and Connect.
- Email editor preserves unsent edits during name, context, and topic changes, and only discards them when Restore Example is selected.
- Optional checklist progress survives navigation in the current browser tab and is removed on opt-out; nothing is sent to the server.
- Modal keyboard focus wraps within the dialog and returns to the originating control after Escape.
- These tests use the exact GitHub JavaScript in mock-DOM harnesses and static-source assertions. They do **not** prove delivery to a real phone or account, nor physical iOS/Android visual correctness.

### Live acceptance still required

Confirm Smitha's authority to publish the site, professional credentials, compliance wording, and real contact methods. Test receipt of actual calls/texts, logged-in and logged-out DMs, calendar confirmations, mobile Safari/Android Chrome and screen readers. The outreach editor remains an unprotected owner-template preview accessible by its direct URL; production private access needs server-side authentication or separate restricted hosting.
