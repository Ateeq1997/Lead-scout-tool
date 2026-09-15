const API = ""; // same origin as the static files when served by Express

const leadsBody = document.getElementById("leadsBody");
const statsRow = document.getElementById("statsRow");
const industryFilter = document.getElementById("industryFilter");
const minScoreInput = document.getElementById("minScore");
const minScoreLabel = document.getElementById("minScoreLabel");
const csvInput = document.getElementById("csvInput");
const exportBtn = document.getElementById("exportBtn");

function scoreBadgeClass(score) {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function money(n) {
  if (!n) return "—";
  return "$" + Number(n).toLocaleString();
}

function renderStats(stats, avgScore, totalLeads) {
  const items = [
    { label: "Clean leads", value: totalLeads },
    { label: "Duplicates removed", value: stats?.duplicatesRemoved ?? 0 },
    { label: "Invalid emails fixed", value: stats?.invalidEmailCount ?? 0 },
    { label: "Avg. ICP score", value: avgScore },
  ];
  statsRow.innerHTML = items
    .map(
      (i) => `<div class="stat-card"><div class="value">${i.value}</div><div class="label">${i.label}</div></div>`
    )
    .join("");
}

function renderTable(leads) {
  leadsBody.innerHTML = leads
    .map(
      (l) => `
      <tr>
        <td><span class="badge ${scoreBadgeClass(l.score)}">${l.score}</span></td>
        <td>
          <div class="company-name">${l.company || "—"}</div>
          <div class="company-domain">${l.domain || ""}</div>
        </td>
        <td>${l.name || "—"}<br/><span class="company-domain">${l.email || ""}</span></td>
        <td>${l.industry || "—"}</td>
        <td>${l.employee_count ?? "—"}</td>
        <td>${money(l.revenue)}</td>
        <td>${l.location || "—"}</td>
      </tr>`
    )
    .join("");
}

function populateIndustries(leads) {
  const industries = [...new Set(leads.map((l) => l.industry).filter(Boolean))].sort();
  const current = industryFilter.value;
  industryFilter.innerHTML =
    `<option value="">All industries</option>` +
    industries.map((i) => `<option value="${i}">${i}</option>`).join("");
  industryFilter.value = current;
}

async function loadLeads() {
  const params = new URLSearchParams();
  if (minScoreInput.value) params.set("minScore", minScoreInput.value);
  if (industryFilter.value) params.set("industry", industryFilter.value);

  const res = await fetch(`${API}/api/leads?${params.toString()}`);
  const data = await res.json();

  const statsRes = await fetch(`${API}/api/stats`);
  const stats = await statsRes.json();

  renderStats(data.stats, stats.avgScore, stats.totalLeads);
  if (!industryFilter.dataset.loaded) {
    populateIndustries(data.leads);
    industryFilter.dataset.loaded = "true";
  }
  renderTable(data.leads);
}

minScoreInput.addEventListener("input", () => {
  minScoreLabel.textContent = minScoreInput.value;
  loadLeads();
});
industryFilter.addEventListener("change", loadLeads);
exportBtn.addEventListener("click", () => window.open(`${API}/api/leads/export`, "_blank"));

csvInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  await fetch(`${API}/api/leads/upload`, { method: "POST", body: formData });
  industryFilter.dataset.loaded = "";
  loadLeads();
});

loadLeads();
