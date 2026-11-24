# Hello, Smitha — Personal Life-Stage Education Site

Independent, client-personalized **educational preview** for Smitha (Los Angeles, California), pending her approval. Not an official financial institution, insurance agency or Medicare website. The watercolor portrait is illustrative, not a photograph.

## Visitor experience
- Personal welcome page with conversational call and text CTAs.
- Find My Path: two-step life-situation guide with connected educational topics.
- Estate planning essentials and living trusts: dedicated guides, decision makers, asset/beneficiary questions, checklists, and California Courts resources.
- Family: marriage, children, home, protection, beneficiaries.
- Later life: retirement, own aging, caring for an older person, and official Medicare Part B guidance.
- Long-term coverage: explanatory cash-value and policy-crediting trade-offs without carrier or branded product promotion.
- Income, financial foundations, legacy/final arrangements, and business continuity.
- Full directory with topic search and filters, primary source links, collapsible questions and print/copy checklists.
- Original Your Next Chapter and Build Something Good interactive guides remain.
- Dedicated Contact Smitha page with Email, Text, Call and a 15-minute Pacific-time preferred-date calendar, plus the compact booking chooser on existing pages.
- An optional four-step, topic-aware question flow turns life-stage concerns into a clear discussion summary, then offers Call, Text, Email and a 15-minute request with Smitha. The internal questioning framework is not visible to customers. No backend lead storage or automatic sending.
- Live appointment confirmation requires a verified external booking calendar; the built-in date and time picker currently prepares a request only. See `BOOKING_SETUP.md`.
- Ask Smitha is an illustrated educational guide; live free-form model answers depend on verified server configuration. Avoid entering private financial, medical or identifying details.

## Implementation
Static site assets reside in `smitha-personal/`. The current Render static service builds from this directory. The separate AI API remains under `smitha-personal/api/`, with any credentials configured only as server environment secrets. No browser script should contain a provider key.

## Release checks
Original 21 HTML pages underwent earlier smoke tests; later additions were verified by source and scripted interaction checks. Run fresh physical-device tests for production acceptance. The life-stage wizard, topic filtering, connected links, checklists, chat popup, phone/text contact dialog, original planning and entrepreneurship interactions passed local Chromium tests. No horizontal overflow or missing internal links. Device handoffs and actual SMS delivery require separate verification on production devices.

## Safety and publication
- Estate and trust topics are legal-education prompts, not documents, legal advice, or a claim that every person must create a trust.
- Medicare guidance links to Medicare.gov; no Medicare affiliation, enrollment, or private plan offers.
- No policy prices, guaranteed returns, specific insurance product names, agent-affiliate claims, partner endorsements, or real customer records.
- All content and professional claims require Smitha’s review and applicable compliance approvals before deployment to her own domain.
