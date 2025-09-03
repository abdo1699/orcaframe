// ---- shared helpers -------------------------------------------------
const $ = (sel) => document.querySelector(sel);

function showToast(message, type = "success") {
  const toast = $("#toast");
  if (!toast) return;
  toast.classList.remove("error");
  if (type !== "success") toast.classList.add("error");
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${
        type === "success" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"
      }" />
    </svg>
    <span>${message}</span>
  `;
  toast.classList.remove("hidden");
  // trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 250);
  }, 2500);
}

async function getAllData() {
  const res = await fetch("/data");
  const json = await res.json();
  return json.ok ? json.data : [];
}

async function saveEntry(payload) {
  const res = await fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ---- page: form -----------------------------------------------------
async function initFormPage() {
  const form = $("#dataForm");
  const status = $("#inlineStatus");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      propertyType: $("#propertyType").value.trim(),
      size: Number($("#size").value),
      price: Number($("#price").value),
      city: $("#city").value.trim(),
    };

    const res = await saveEntry(payload);
    status.innerHTML = "";
    if (res.ok) {
      form.reset();

      // inline success banner
      status.innerHTML = `
        <div class="mt-2 rounded-xl border border-emerald-500/40 bg-emerald-900/40 text-emerald-200 px-4 py-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Data saved successfully.</span>
          <a href="dashboard.html" class="ml-auto underline decoration-emerald-300 hover:opacity-90">Open Dashboard</a>
        </div>
      `;
      showToast("Saved. View it on the dashboard ✅", "success");
    } else {
      status.innerHTML = `
        <div class="mt-2 rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-200 px-4 py-3">
          ${res.message || "Could not save entry."}
        </div>
      `;
      showToast("Could not save entry.", "error");
    }
  });
}

// ---- page: dashboard ------------------------------------------------
function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function groupCount(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function buildCharts(data) {
  const el = (id) => document.getElementById(id);
  if (!data || !data.length) {
    ["kpiTotal", "kpiSize", "kpiPrice"].forEach((id) => {
      const n = el(id);
      if (n) n.textContent = "0";
    });
    return;
  }

  // KPIs
  el("kpiTotal").textContent = data.length;
  el("kpiSize").textContent = sum(data.map((d) => d.size)).toLocaleString();
  el("kpiPrice").textContent = sum(data.map((d) => d.price)).toLocaleString();

  // labels
  const labels = data.map((d) => `${d.propertyType} • ${d.city}`);
  const prices = data.map((d) => d.price);
  const sizes = data.map((d) => d.size);

  // groups
  const byCity = groupCount(data, "city");
  const byType = groupCount(data, "propertyType");

  // palette (muted luxury)
  const colors = [
    "#facc15",
    "#22c55e",
    "#60a5fa",
    "#f97316",
    "#a78bfa",
    "#f43f5e",
    "#14b8a6",
    "#eab308",
  ];

  // destroy old charts if any (hot reload safe)
  Chart.helpers.each(Chart.instances, function (instance) {
    instance.destroy();
  });

  // Prices by Property (bar)
  new Chart(el("chartPrices"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Price (EGP)", data: prices, backgroundColor: colors },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#d4d4d8" } },
        y: { ticks: { color: "#d4d4d8" } },
      },
    },
  });

  // Count by City (doughnut, compact)
  new Chart(el("chartCities"), {
    type: "doughnut",
    data: {
      labels: Object.keys(byCity),
      datasets: [{ data: Object.values(byCity), backgroundColor: colors }],
    },
    options: {
      plugins: { legend: { position: "bottom", labels: { color: "#e5e7eb" } } },
    },
  });

  // Count by Type (horizontal bar)
  new Chart(el("chartTypes"), {
    type: "bar",
    data: {
      labels: Object.keys(byType),
      datasets: [
        {
          label: "Count",
          data: Object.values(byType),
          backgroundColor: "#60a5fa",
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#d4d4d8" } },
        y: { ticks: { color: "#d4d4d8" } },
      },
    },
  });

  // Trend by timestamp (line)
  const sorted = [...data].sort((a, b) => a.ts - b.ts);
  new Chart(el("chartTrend"), {
    type: "line",
    data: {
      labels: sorted.map((d) => new Date(d.ts).toLocaleString()),
      datasets: [
        {
          label: "Price Trend",
          data: sorted.map((d) => d.price),
          borderColor: "#facc15",
          backgroundColor: "rgba(250,204,21,.25)",
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#d4d4d8" } },
        y: { ticks: { color: "#d4d4d8" } },
      },
    },
  });

  // Bubble (Size vs Price)
  new Chart(el("chartBubble"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Size vs Price",
          data: data.map((d) => ({ x: d.size, y: d.price })),
          backgroundColor: "#22c55e",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: "Size (sqm)", color: "#e5e7eb" },
          ticks: { color: "#d4d4d8" },
        },
        y: {
          title: { display: true, text: "Price (EGP)", color: "#e5e7eb" },
          ticks: { color: "#d4d4d8" },
        },
      },
    },
  });
}

async function initDashboardPage() {
  const { data } = await (await fetch("/data")).json();
  buildCharts(data);
}

// ---- boot -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  if (page === "form") initFormPage();
  if (page === "dashboard") initDashboardPage();
});
