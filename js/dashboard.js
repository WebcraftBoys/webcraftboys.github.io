"use strict";

/**

* =========================================================
* WEBCRAFT — DASHBOARD.JS
* =========================================================
*
* Production-ready dashboard foundation.
*
* Handles:
* * Dashboard initialization
* * Analytics connection state
* * Metric cards
* * Traffic chart
* * Top pages
* * Traffic sources
* * Device breakdown
* * Recent activity
* * Website health
* * Last updated state
* * Loading / empty / error states
*
* IMPORTANT:
* This file does NOT invent analytics numbers.
*
* Real visitor data should be supplied through the
* analytics adapter below once Google Analytics or
* another provider is connected.
* =========================================================
  */


/* =========================================================
DASHBOARD CONFIG
========================================================= */

const DASHBOARD_CONFIG = {
currency: "INR",

analyticsProvider: "Google Analytics",

refreshInterval: 5 * 60 * 1000,

chartDays: 30
};

/* =========================================================
DASHBOARD STATE
========================================================= */

const dashboardState = {
connected: false,

loading: false,

error: null,

lastUpdated: null,

period: "30d",

data: null
};

/* =========================================================
ANALYTICS ADAPTER
========================================================= */

/**

* This is the only part that should eventually communicate
* with your real analytics backend.
*
* Do NOT put Google Analytics API credentials directly into
* this frontend JavaScript.
*
* A secure backend/serverless endpoint should eventually
* return the required analytics data.
  */

const AnalyticsAdapter = {

async getDashboardData() {


/*
 * Analytics is not connected yet.
 *
 * Returning null allows the dashboard to display a
 * professional connection state instead of fake data.
 */

return null;


}
};

/* =========================================================
DOM REFERENCES
========================================================= */

function getDashboardElements() {

return {


dashboard:
  $("#dashboard"),

loading:
  $("#dashboardLoading"),

empty:
  $("#dashboardEmpty"),

error:
  $("#dashboardError"),

content:
  $("#dashboardContent"),

connection:
  $("#analyticsConnection"),

lastUpdated:
  $("#lastUpdated"),

refreshButton:
  $("#refreshDashboard"),

periodButtons:
  $$(".dashboard-period"),

metricCards:
  $$(".dashboard-metric"),

chart:
  $("#trafficChart"),

topPages:
  $("#topPages"),

trafficSources:
  $("#trafficSources"),

devices:
  $("#deviceBreakdown"),

activity:
  $("#recentActivity"),

health:
  $("#websiteHealth")


};
}

/* =========================================================
DASHBOARD STATE UI
========================================================= */

function showDashboardState(state) {

const elements =
getDashboardElements();

if (elements.loading) {
elements.loading.hidden =
state !== "loading";
}

if (elements.empty) {
elements.empty.hidden =
state !== "empty";
}

if (elements.error) {
elements.error.hidden =
state !== "error";
}

if (elements.content) {
elements.content.hidden =
state !== "ready";
}
}

/* =========================================================
CONNECTION STATUS
========================================================= */

function updateConnectionStatus(connected) {

const connection =
$("#analyticsConnection");

if (!connection) return;

connection.classList.toggle(
"connected",
connected
);

connection.classList.toggle(
"disconnected",
!connected
);

const status =
connection.querySelector(
"[data-connection-status]"
);

if (status) {


status.textContent =
  connected
    ? "Analytics connected"
    : "Analytics not connected";


}
}

/* =========================================================
FORMATTERS
========================================================= */

function formatNumber(value) {

if (
typeof value !== "number" ||
!Number.isFinite(value)
) {
return "—";
}

return new Intl.NumberFormat(
"en-IN"
).format(value);
}

function formatPercentage(value) {

if (
typeof value !== "number" ||
!Number.isFinite(value)
) {
return "—";
}

return `${value.toFixed(1)}%`;
}

function formatDuration(seconds) {

if (
typeof seconds !== "number" ||
!Number.isFinite(seconds) ||
seconds < 0
) {
return "—";
}

const minutes =
Math.floor(seconds / 60);

const remainingSeconds =
Math.round(seconds % 60);

if (!minutes) {
return `${remainingSeconds}s`;
}

return `${minutes}m ${String(
    remainingSeconds
  ).padStart(2, "0")}s`;
}

function formatDate(date) {

if (!(date instanceof Date)) {
return "—";
}

return new Intl.DateTimeFormat(
"en-IN",
{
day: "numeric",
month: "short",
year: "numeric",
hour: "numeric",
minute: "2-digit"
}
).format(date);
}

/* =========================================================
METRIC VALUE
========================================================= */

function setMetric(
selector,
value,
formatter = formatNumber
) {

const element =
$(selector);

if (!element) return;

element.textContent =
formatter(value);
}

/* =========================================================
RENDER METRICS
========================================================= */

function renderMetrics(data) {

if (!data?.metrics) return;

const metrics =
data.metrics;

setMetric(
"#metricVisitors",
metrics.visitors
);

setMetric(
"#metricPageviews",
metrics.pageviews
);

setMetric(
"#metricSessions",
metrics.sessions
);

setMetric(
"#metricBounceRate",
metrics.bounceRate,
formatPercentage
);

setMetric(
"#metricSessionDuration",
metrics.averageSessionDuration,
formatDuration
);

setMetric(
"#metricNewVisitors",
metrics.newVisitors
);
}

/* =========================================================
RENDER TRAFFIC CHART
========================================================= */

function renderTrafficChart(data) {

const canvas =
$("#trafficChart");

if (!canvas) return;

const context =
canvas.getContext("2d");

if (!context) return;

const points =
Array.isArray(data?.traffic)
? data.traffic
: [];

context.clearRect(
0,
0,
canvas.width,
canvas.height
);

if (!points.length) {


renderChartEmptyState(
  canvas
);

return;


}

/*

* Canvas chart intentionally stays dependency-free.
  */

const width =
canvas.width;

const height =
canvas.height;

const padding =
40;

const values =
points.map(
point =>
Number(point.visitors) || 0
);

const max =
Math.max(
...values,
1
);

const chartWidth =
width - padding * 2;

const chartHeight =
height - padding * 2;

context.beginPath();

points.forEach(
(point, index) => {


  const x =
    padding +
    (
      index /
      Math.max(
        points.length - 1,
        1
      )
    ) *
    chartWidth;

  const value =
    Number(
      point.visitors
    ) || 0;

  const y =
    height -
    padding -
    (value / max) *
    chartHeight;

  if (index === 0) {
    context.moveTo(
      x,
      y
    );
  } else {
    context.lineTo(
      x,
      y
    );
  }
}


);

context.strokeStyle =
getComputedStyle(
document.documentElement
).getPropertyValue(
"--accent"
) || "#168789";

context.lineWidth =
2;

context.stroke();
}

/* =========================================================
EMPTY CHART
========================================================= */

function renderChartEmptyState(
canvas
) {

const context =
canvas.getContext("2d");

if (!context) return;

const width =
canvas.width;

const height =
canvas.height;

context.clearRect(
0,
0,
width,
height
);

context.fillStyle =
"#8a918c";

context.font =
"14px DM Sans, sans-serif";

context.textAlign =
"center";

context.textBaseline =
"middle";

context.fillText(
"Connect analytics to see traffic",
width / 2,
height / 2
);
}

/* =========================================================
RENDER TOP PAGES
========================================================= */

function renderTopPages(data) {

const container =
$("#topPages");

if (!container) return;

const pages =
Array.isArray(data?.topPages)
? data.topPages
: [];

if (!pages.length) {


renderListEmpty(
  container,
  "No page data available yet."
);

return;


}

container.innerHTML =
pages.map(page => {


  const title =
    escapeHTML(
      page.title ||
      page.path ||
      "Untitled page"
    );

  const path =
    escapeHTML(
      page.path ||
      ""
    );

  const views =
    formatNumber(
      Number(page.views)
    );

  return `
    <div class="dashboard-list-row">
      <div>
        <strong>${title}</strong>
        <span>${path}</span>
      </div>

      <b>${views}</b>
    </div>
  `;

}).join("");


}

/* =========================================================
RENDER TRAFFIC SOURCES
========================================================= */

function renderTrafficSources(data) {

const container =
$("#trafficSources");

if (!container) return;

const sources =
Array.isArray(
data?.trafficSources
)
? data.trafficSources
: [];

if (!sources.length) {


renderListEmpty(
  container,
  "No traffic-source data available."
);

return;


}

container.innerHTML =
sources.map(source => {


  const name =
    escapeHTML(
      source.name ||
      "Unknown"
    );

  const sessions =
    formatNumber(
      Number(
        source.sessions
      )
    );

  const percentage =
    formatPercentage(
      Number(
        source.percentage
      )
    );

  return `
    <div class="dashboard-list-row">
      <div>
        <strong>${name}</strong>
        <span>${percentage} of sessions</span>
      </div>

      <b>${sessions}</b>
    </div>
  `;

}).join("");


}

/* =========================================================
RENDER DEVICE BREAKDOWN
========================================================= */

function renderDevices(data) {

const container =
$("#deviceBreakdown");

if (!container) return;

const devices =
Array.isArray(
data?.devices
)
? data.devices
: [];

if (!devices.length) {


renderListEmpty(
  container,
  "No device data available."
);

return;


}

container.innerHTML =
devices.map(device => {


  const name =
    escapeHTML(
      device.name ||
      "Unknown"
    );

  const percentage =
    Number(
      device.percentage
    ) || 0;

  return `
    <div class="dashboard-device-row">

      <div class="dashboard-device-label">
        <span>${name}</span>
        <b>${percentage.toFixed(1)}%</b>
      </div>

      <div class="dashboard-progress">
        <span
          style="width:${Math.min(
            Math.max(
              percentage,
              0
            ),
            100
          )}%"
        ></span>
      </div>

    </div>
  `;

}).join("");


}

/* =========================================================
RENDER RECENT ACTIVITY
========================================================= */

function renderRecentActivity(data) {

const container =
$("#recentActivity");

if (!container) return;

const activity =
Array.isArray(
data?.recentActivity
)
? data.recentActivity
: [];

if (!activity.length) {


renderListEmpty(
  container,
  "No recent activity available."
);

return;


}

container.innerHTML =
activity.map(item => {


  const title =
    escapeHTML(
      item.title ||
      "Website activity"
    );

  const detail =
    escapeHTML(
      item.detail ||
      ""
    );

  const time =
    escapeHTML(
      item.time ||
      ""
    );

  return `
    <div class="dashboard-activity-row">

      <div class="dashboard-activity-dot"></div>

      <div>
        <strong>${title}</strong>
        <span>${detail}</span>
      </div>

      <time>${time}</time>

    </div>
  `;

}).join("");


}

/* =========================================================
WEBSITE HEALTH
========================================================= */

function renderWebsiteHealth(data) {

const container =
$("#websiteHealth");

if (!container) return;

const checks =
Array.isArray(
data?.health
)
? data.health
: [];

if (!checks.length) {


renderListEmpty(
  container,
  "Health checks will appear here."
);

return;


}

container.innerHTML =
checks.map(check => {


  const status =
    ["good", "warning", "error"]
      .includes(check.status)
      ? check.status
      : "warning";

  const title =
    escapeHTML(
      check.title ||
      "Website check"
    );

  const detail =
    escapeHTML(
      check.detail ||
      ""
    );

  return `
    <div class="dashboard-health-row">

      <span
        class="dashboard-health-status ${status}"
        aria-hidden="true"
      ></span>

      <div>
        <strong>${title}</strong>
        <span>${detail}</span>
      </div>

    </div>
  `;

}).join("");


}

/* =========================================================
EMPTY LIST
========================================================= */

function renderListEmpty(
container,
message
) {

container.innerHTML = `     <div class="dashboard-empty-inline">
      ${escapeHTML(message)}     </div>
  `;
}

/* =========================================================
ESCAPE HTML
========================================================= */
function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
/* =========================================================
RENDER DASHBOARD
========================================================= */

function renderDashboard(data) {

dashboardState.data =
data;

dashboardState.connected =
Boolean(data);

dashboardState.lastUpdated =
new Date();

updateConnectionStatus(
dashboardState.connected
);

if (!data) {


showDashboardState(
  "empty"
);

updateLastUpdated();

return;


}

renderMetrics(data);

renderTrafficChart(data);

renderTopPages(data);

renderTrafficSources(data);

renderDevices(data);

renderRecentActivity(data);

renderWebsiteHealth(data);

showDashboardState(
"ready"
);

updateLastUpdated();
}

/* =========================================================
LAST UPDATED
========================================================= */

function updateLastUpdated() {

const element =
$("#lastUpdated");

if (!element) return;

if (!dashboardState.lastUpdated) {


element.textContent =
  "Not updated yet";

return;


}

element.textContent =
`Updated ${formatDate(
      dashboardState.lastUpdated
    )}`;
}

/* =========================================================
LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

if (dashboardState.loading) {
return;
}

dashboardState.loading =
true;

dashboardState.error =
null;

showDashboardState(
"loading"
);

try {


const data =
  await AnalyticsAdapter
    .getDashboardData();

renderDashboard(
  data
);


} catch (error) {


console.error(
  "Webcraft dashboard error:",
  error
);

dashboardState.error =
  error;

showDashboardState(
  "error"
);


} finally {


dashboardState.loading =
  false;


}
}

/* =========================================================
REFRESH BUTTON
========================================================= */

function initRefreshButton() {

const button =
$("#refreshDashboard");

if (!button) return;

button.addEventListener(
"click",
async () => {


  button.disabled =
    true;

  try {

    await loadDashboard();

  } finally {

    button.disabled =
      false;
  }
}


);
}

/* =========================================================
PERIOD FILTER
========================================================= */

function initPeriodControls() {

const buttons =
$$(".dashboard-period");

if (!buttons.length) return;

buttons.forEach(button => {


button.addEventListener(
  "click",
  () => {

    const period =
      button.dataset.period;

    if (!period) return;

    dashboardState.period =
      period;

    buttons.forEach(item => {

      const active =
        item === button;

      item.classList.toggle(
        "active",
        active
      );

      item.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    /*
     * Once the analytics adapter is connected,
     * reload data for the selected period.
     */

    loadDashboard();
  }
);


});
}

/* =========================================================
AUTO REFRESH
========================================================= */

function initAutoRefresh() {

window.setInterval(
() => {


  /*
   * Do not constantly refresh while the page
   * is hidden in another browser tab.
   */

  if (
    document.visibilityState !==
    "visible"
  ) {
    return;
  }

  loadDashboard();

},
DASHBOARD_CONFIG.refreshInterval


);
}

/* =========================================================
KEYBOARD ACCESSIBILITY
========================================================= */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", event => {
    const activeElement = document.activeElement;

    const isTyping =
      activeElement &&
      (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT"
      );

    /*
     * Press R to refresh the dashboard.
     * Do not trigger it while typing in a form field.
     */
    if (
      event.key.toLowerCase() === "r" &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !isTyping
    ) {
      loadDashboard();
    }
  });
}

/* =========================================================
ANALYTICS EMPTY STATE
========================================================= */

function initAnalyticsEmptyState() {

const empty =
$("#dashboardEmpty");

if (!empty) return;

const provider =
empty.querySelector(
"[data-analytics-provider]"
);

if (provider) {


provider.textContent =
  DASHBOARD_CONFIG
    .analyticsProvider;


}
}

/* =========================================================
DASHBOARD INITIALIZATION
========================================================= */

function initDashboard() {

if (
!$("#dashboard") &&
!$("#dashboardContent")
) {
return;
}

initRefreshButton();

initPeriodControls();

initKeyboardShortcuts();

initAnalyticsEmptyState();

loadDashboard();

initAutoRefresh();

console.log(
"Webcraft dashboard initialized."
);
}

/* =========================================================
START
========================================================= */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
"DOMContentLoaded",
initDashboard,
{
once: true
}
);

} else {

initDashboard();

}
