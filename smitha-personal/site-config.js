/* Owner-editable contact settings and FICTIONAL demonstration examples.
   Only channels marked verified:true with valid URLs are shown as active.
   Do not publish customer records, credentials, or private keys here. */
window.SMITHA_SITE_CONFIG = Object.freeze({
  identity: {
    name: "Smitha Rangaswamy",
    displayTitle: "Licensed Financial Professional & Entrepreneur Builder",
    city: "Los Angeles, California",
    tagline: "Plan Today | Build Tomorrow",
    illustration: "assets/smitha-watercolor.webp",
    status: "Independent preview, pending Smitha's review"
  },
  contact: {
    phone: { display: "(818) 626-4474", e164: "+18186264474", verifiedForVoice: true, verifiedForSms: false },
    email: { address: "", verified: false, exampleOnly: "hello@smitha.example" },
    whatsapp: { url: "", verified: false, exampleOnly: "https://wa.me/18185550137" },
    facebook: { url: "", verified: false, exampleOnly: "https://m.me/smitha.example" },
    instagram: { url: "", verified: false, exampleOnly: "https://ig.me/m/smitha.example" },
    linkedin: { url: "", verified: false, exampleOnly: "https://www.linkedin.com/in/smitha-example/" },
    x: { url: "", verified: false, exampleOnly: "https://x.com/smitha_example" },
    tiktok: { url: "", verified: false, exampleOnly: "https://www.tiktok.com/@smitha.example" },
    booking: { url: "", verified: false, exampleOnly: "https://calendly.com/smitha-example/intro" }
  },
  priorities: { firstTopic: "estate", nextTopic: "trusts", requireAttorneyForTrustDocuments: true },
  sampleJourneys: [
    { label:"First home", persona:"Maya and Dev (illustrative)", situation:"Recently purchased a home; want to identify decision-makers and review beneficiaries.", topic:"estate" },
    { label:"New parents", persona:"Priya and Daniel (illustrative)", situation:"Have a young child and want to talk about guardians, education goals and household continuity.", topic:"children" },
    { label:"Caring for Mom", persona:"Elena (illustrative)", situation:"Helping an aging parent review medical wishes, documents and day-to-day care.", topic:"caregiving" },
    { label:"Approaching 65", persona:"Robert (illustrative)", situation:"Still working and unsure when to review Medicare Part B enrollment rules.", topic:"medicare" },
    { label:"Business owner", persona:"Amir (illustrative)", situation:"Wants continuity arrangements and a plan for who can step in when needed.", topic:"business" }
  ]
});
