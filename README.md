# Lead Scout — Smart Lead Scoring & Deduplication

A focused enhancement to the reference tool (saasquatchleads.com), built for the
Caprae Capital AI-Readiness Challenge in under 5 hours.

## Approach: Quality First

Instead of cloning multiple shallow features, I picked **one high-leverage
problem** raw lead lists actually have: they're messy (duplicates, bad emails,
inconsistent domains) and unordered (a sales rep has to read every row to find
the good ones). Lead Scout fixes both:

1. **Cleans** the list — normalizes emails/domains, removes duplicates
   (keeping the most complete record), and flags invalid emails instead of
   silently dropping the row.
2. **Scores** every lead 0–100 against a simple ICP (industry fit, revenue
   band, company size, data completeness) so the highest-value leads sort to
   the top automatically.
3. **Surfaces it** in a clean dashboard a sales rep can filter and export
   from — no engineering required to use it day to day.

## Why this matters for Caprae specifically

Caprae's own lead-gen challenge brief highlights matching leads to a target
market and minimizing irrelevant data as a top evaluation criterion. Since
Caprae's public materials describe targeting revenue-generating North
American companies in a specific band across the sectors it invests in, I
modeled the ICP directly on that — SaaS, healthcare, food-agtech,
cybersecurity, biotech, fintech, consumer, with a $5M–$25M revenue sweet
spot. Swapping those constants for a different mandate takes one line of code.

## Architecture

```
lead-scout/
├── backend/            Node.js + Express API
│   ├── server.js        Routes: upload, list, filter, export, stats
│   ├── utils/
│   │   ├── dedupe.js     Normalization + duplicate resolution
│   │   └── scoring.js    ICP scoring model
│   └── data/
│       └── sample-leads.csv   Seed dataset with intentional dupes/bad data
└── frontend/           Static HTML/CSS/vanilla JS dashboard
    ├── index.html
    ├── style.css
    └── app.js
```

**Stack choices and why:**

- **Node.js/Express backend** — matches the MERN stack I use day to day and
  is the fastest way to stand up a small REST API in a 5-hour window.
- **Vanilla JS frontend** (not a full React build) — this is a UI a rep opens
  a few times a day, not an app that needs client-side state management. It
  ships with zero build step, which matters when the whole project is
  time-boxed. In a real MERN version I'd swap this for a Next.js page reusing
  the same API — the API is already framework-agnostic.
- **In-memory store for the demo** — for production, I'd swap this for
  **MongoDB** with a compound index on `email`/`domain` so dedup checks run
  server-side even at 100k+ rows, plus **Redis** to cache the "top N leads by
  score" query since that's the one hit on every dashboard load.
- **Hosting** — the frontend is static, so it fits on Vercel or S3 +
  CloudFront; the API is stateless and containerizes cleanly for a small
  AWS ECS/Fargate service or a Lambda behind API Gateway if traffic stays
  bursty rather than constant. Deploys via GitHub Actions on push to `main`.
- **CSV in/out** rather than a scraper — the challenge brief points at an
  existing scraping tool; rebuilding scraping infra in 5 hours would trade
  depth on scoring/cleaning (where I could show more judgment) for breadth.
  The upload endpoint is the seam where a real scraper's output would plug
  in without changing anything downstream.

## Running it locally

```bash
cd backend
npm install
npm start        # API + static frontend on http://localhost:4000
```

Open `http://localhost:4000` — the bundled `sample-leads.csv` (20 raw rows,
including 3 intentional duplicates and 1 malformed email) loads automatically
so the cleaning/scoring is visible immediately. Upload your own CSV with the
**Upload CSV** button to test other data; columns expected:
`name,email,company,domain,industry,employee_count,revenue,location`.

## What I'd build next with more time

- Real enrichment (company size/revenue lookups via a data provider API)
  instead of relying on the CSV already having those fields.
- A "why this score" tooltip exposing the `scoreBreakdown` already returned
  by the API but not yet shown in the UI.
- CRM export mapping (HubSpot/Salesforce field mapping) instead of a flat
  CSV, since that's the actual last-mile step a sales team needs.
