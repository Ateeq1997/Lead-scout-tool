const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { dedupeLeads } = require("./utils/dedupe");
const { scoreLeads } = require("./utils/scoring");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// In-memory store. A real deployment would use MongoDB (see README)
// so results survive restarts and can be queried/filtered server-side
// at scale, but for a 5-hour build this keeps the demo fast and simple.
let store = { leads: [], stats: null, lastUploadedAt: null };

// --- Minimal CSV parser (no external dep) ---------------------------------
// Handles the common case: comma-separated, first row = headers,
// no embedded commas inside quoted fields (fine for this dataset size).
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => (row[h] = (cells[i] || "").trim()));
    return row;
  });
}

function loadAndProcess(csvText) {
  const rawRows = parseCsv(csvText);
  const { leads, stats } = dedupeLeads(rawRows);
  const scored = scoreLeads(leads);
  store = { leads: scored, stats, lastUploadedAt: new Date().toISOString() };
  return store;
}

// Preload the bundled sample dataset on boot so the dashboard has data
// to show immediately without requiring an upload first.
const samplePath = path.join(__dirname, "data", "sample-leads.csv");
if (fs.existsSync(samplePath)) {
  loadAndProcess(fs.readFileSync(samplePath, "utf8"));
}

// --- Routes -----------------------------------------------------------------

app.post("/api/leads/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const csvText = req.file.buffer.toString("utf8");
  const result = loadAndProcess(csvText);
  res.json(result);
});

app.get("/api/leads", (req, res) => {
  const { minScore, industry } = req.query;
  let leads = store.leads;
  if (minScore) leads = leads.filter((l) => l.score >= Number(minScore));
  if (industry) {
    leads = leads.filter(
      (l) => l.industry.toLowerCase() === industry.toLowerCase()
    );
  }
  res.json({ leads, stats: store.stats, lastUploadedAt: store.lastUploadedAt });
});

app.get("/api/leads/export", (req, res) => {
  const headers = [
    "name", "email", "company", "domain", "industry",
    "employee_count", "revenue", "location", "score",
  ];
  const rows = store.leads.map((l) => headers.map((h) => l[h] ?? "").join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=scored-leads.csv");
  res.send(csv);
});

app.get("/api/stats", (req, res) => {
  const industries = {};
  store.leads.forEach((l) => {
    industries[l.industry] = (industries[l.industry] || 0) + 1;
  });
  const avgScore = store.leads.length
    ? Math.round(store.leads.reduce((sum, l) => sum + l.score, 0) / store.leads.length)
    : 0;
  res.json({ ...store.stats, avgScore, industries, totalLeads: store.leads.length });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Lead Scout API running on port ${PORT}`));
