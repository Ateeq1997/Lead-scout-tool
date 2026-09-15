# Video Walkthrough Script (target: 90 seconds)

Record your screen (Loom/OBS/Zoom) showing the dashboard while you talk.
Read this loosely in your own words — don't read it verbatim on camera.

**0:00–0:15 — What you built and why**
"I looked at [saasquatchleads.com] and focused on one problem every raw lead
list has: it's messy and unranked. So instead of adding several shallow
features, I built one thing well — a tool that cleans a lead list and scores
each lead against an ideal customer profile, so a sales rep sees the best
leads first instead of reading every row."

**0:15–0:40 — Demo the cleaning**
[Show the stats cards] "This sample file has 20 raw rows with 3 duplicates
and one invalid email. Lead Scout normalizes emails and domains, merges
duplicates keeping the most complete record, and flags bad data instead of
silently dropping it — here you can see 17 clean leads came out of that."

**0:40–1:05 — Demo the scoring + filtering**
[Show the table, sort by score, change the industry filter and score slider]
"Each lead gets a 0-100 score based on industry fit, revenue band, company
size, and how complete its data is. I modeled the target profile on Caprae's
own stated focus — [industries], $5M–$25M revenue. You can filter by
industry or minimum score, and export the cleaned, scored list as CSV."

**1:05–1:25 — Architecture, briefly**
"It's a Node/Express API with the scoring and dedup logic as separate,
testable modules, and a lightweight static frontend — no build step needed.
In production I'd move storage to MongoDB with indexes on email and domain,
add Redis caching for the top-leads query, and deploy the API on
AWS Fargate with the frontend on Vercel or S3."

**1:25–end — Close**
"The upload endpoint is the seam — swap in real scraped data and the
cleaning and scoring run the same way. Thanks for watching."

---
Tips:
- Keep it under 2 minutes — evaluators are scoring dozens of these.
- Show the dashboard live, not slides.
- If you extended the time budget past 5 hours, say so honestly and explain
  what you'd cut to hit 5 hours next time — that's a stronger signal than
  pretending it took exactly 5.
