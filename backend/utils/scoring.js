/**
 * scoring.js
 * Scores each cleaned lead 0-100 against a simple Ideal Customer
 * Profile (ICP), so a sales team can sort a messy list by
 * "who's worth calling first" instead of reading every row.
 *
 * ICP here is modeled loosely on Caprae's stated acquisition
 * targets: North American, growing companies, revenue roughly
 * $5M-$25M, in sectors they actively invest in.
 */

const TARGET_INDUSTRIES = [
  "saas",
  "healthcare",
  "food-agtech",
  "agtech",
  "cybersecurity",
  "biotech",
  "fintech",
  "consumer",
];

const REVENUE_MIN = 5_000_000;
const REVENUE_MAX = 25_000_000;
const EMPLOYEE_MIN = 10;
const EMPLOYEE_MAX = 250;

function industryFitScore(industry) {
  if (!industry) return 0;
  return TARGET_INDUSTRIES.includes(industry.toLowerCase()) ? 30 : 5;
}

function revenueFitScore(revenue) {
  if (!revenue || revenue <= 0) return 0;
  if (revenue >= REVENUE_MIN && revenue <= REVENUE_MAX) return 30;
  // partial credit the closer it is to the target band
  const distance =
    revenue < REVENUE_MIN ? REVENUE_MIN - revenue : revenue - REVENUE_MAX;
  const partial = Math.max(0, 30 - distance / 1_000_000 * 2);
  return Math.round(partial);
}

function sizeFitScore(employeeCount) {
  if (!employeeCount || employeeCount <= 0) return 0;
  if (employeeCount >= EMPLOYEE_MIN && employeeCount <= EMPLOYEE_MAX) return 20;
  return employeeCount < EMPLOYEE_MIN ? 8 : 5;
}

function dataCompletenessScore(lead) {
  const fields = ["email", "domain", "location", "employee_count", "revenue"];
  const present = fields.filter((f) => lead[f]).length;
  return Math.round((present / fields.length) * 20);
}

function scoreLead(lead) {
  const breakdown = {
    industryFit: industryFitScore(lead.industry),
    revenueFit: revenueFitScore(lead.revenue),
    sizeFit: sizeFitScore(lead.employee_count),
    dataCompleteness: dataCompletenessScore(lead),
  };
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score: Math.min(100, total), breakdown };
}

function scoreLeads(leads) {
  return leads
    .map((lead) => {
      const { score, breakdown } = scoreLead(lead);
      return { ...lead, score, scoreBreakdown: breakdown };
    })
    .sort((a, b) => b.score - a.score);
}

module.exports = { scoreLead, scoreLeads };
