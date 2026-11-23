# Smitha MVP — end-to-end acceptance cases
All people and scenarios below are **fictional**, for testing only. No third-party account, legal document or customer record should be created.

| # | Visitor story and entry point | Key path | Required real outcome |
|---|---|---|---|
| 1 | Maya bought a home and needs to identify decision-makers | index -> estate -> handouts?topic=estate -> Call/Text | Estate guide is readable and print/share works; call invokes `tel:+18186264474`, text invokes `sms:` draft |
| 2 | Dev asks if everyone must have a living trust | index -> trusts -> California legal resource -> CTA | Trust described as optional and attorney-managed, no guarantee of probate outcome |
| 3 | Priya and Daniel have a baby | my-path family -> children -> handouts?topic=children -> text | Guardianship, beneficiary and savings questions; no personal data collected |
| 4 | Elena is helping her older mother | caregiving -> relevant Medicare official resource -> chat -> contact | Direct next step after reading and safe privacy language |
| 5 | Robert is still employed approaching 65 | medicare -> official enrollment resource -> handouts?topic=retirement -> call | Does not invent enrollment eligibility or premium; warns that timing is situation-specific |
| 6 | Amir owns a growing small business | business -> handouts?topic=business -> text | Practical continuity questions and no invented partner agreements |
| 7 | Newlyweds review responsibilities | marriage -> estate -> trusts -> call | Seamless cross-topic navigation without forcing a product |
| 8 | After a local seminar Smitha wants to follow up | outreach-kit -> after-event template -> customize -> copy/open mail | Warm educational draft; no automatic sending or recipient list upload |
| 9 | Someone needs one printable resource | handouts -> select trusts -> print -> native share | Only selected takeaway is printable; current share URL preserves selected topic |
| 10 | Visitor prefers Instagram or Facebook | contact panel with only test configuration | No fake DM link; verified URL in config is required before clickable CTA appears |
| 11 | Visitor arrives from a shared estate email on iPhone | estate landing -> mobile quick-action Call/Text/Talk | Quick-actions visible; no horizontal overflow or hidden/overlapping chat |
| 12 | Visitor has sensitive account info | chat and contact | Context explicitly discourages entering Social Security, Medicare or account numbers |
| 13 | Visitor wants to schedule immediately | Find a time | Draft request opens; site does not falsely claim that time is reserved |
| 14 | Visitor wants to send a first STAR note | any page -> Talk -> Situation/Task/Action/Result -> Text | Context prefilled, visitor may edit, no server storage; sending remains a separate action |
| 15 | Client owner wants to configure DMs | edit site-config.js -> verified URL -> deploy | Only verified real HTTPS URLs activate. Test examples never activate. |
| 16 | Visitor uses print on resources | printable takeaway | Body text and source links fit page; interactive site chrome hidden in print |
| 17 | Prospect wants to understand policy value | long-term-protection -> official California DOI -> Call | Explains guarantees, loans, lapses/fees without making promises |
| 18 | Generic search or topic browsing | explore -> filter and open guide -> contextual CTA | No dead end for an unfamiliar topic |
| 19 | Source control change | GitHub isolated branch -> Render | Main portfolio and Nisha's demo are unchanged |
| 20 | Smitha asks for trust formation | estate/trust pages | Explicit referral to qualified California estate attorney; no DIY legal-document generation |

## Browser smoke test notes
Test at widths 390px and 1440px on Chromium; then verify the device-native `tel:`, `sms:`, print, share and clipboard behavior on an iPhone/Android or desktop with supported applications. Browser navigation can be tested without sending actual messages. No end-to-end delivery or AI functionality should be claimed without real credentials and an acceptance receipt.
