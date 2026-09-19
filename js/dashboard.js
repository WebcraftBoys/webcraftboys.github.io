"use strict";

/**
 * =========================================================
 * WEBCRAFT — DASHBOARD.JS
 * =========================================================
 *
 * Connects the Webcraft dashboard to the secure Cloudflare
 * Analytics Worker.
 *
 * IMPORTANT:
 * - No Cloudflare API token is stored here.
 * - The browser talks only to the Worker.
 * - The Worker talks to Cloudflare Analytics.
 * =========================================================
 */


/* =========================================================
   DASHBOARD CONFIG
========================================================= */

const DASHBOARD_CONFIG = {
  analyticsEndpoint:
    "https://webcraft-analytics-api.webcraft-devwork.workers.dev/api/analytics/data",

  refreshInterval:
    5 * 60 * 1000
};


/* =========================================================
   DASHBOARD STATE
========================================================= */

const dashboardState = {
  loading: false,
  error: null,
  lastUpdated: null,
  period: "30d",
  data: null
};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}


/* =========================================================
   ANALYTICS ADAPTER
========================================================= */

const AnalyticsAdapter = {

  async getDashboardData(period = "30d") {

    const endpoint =
      new URL(
        DASHBOARD_CONFIG.analyticsEndpoint
      );

    endpoint.searchParams.set(
      "range",
      period
    );

    const response =
      await fetch(
        endpoint.toString(),
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          },
          credentials: "omit",
          cache: "no-store"
        }
      );

    let result;

    try {
      result =
        await response.json();
    } catch {
      throw new Error(
        "Analytics Worker returned invalid JSON."
      );
    }

    if (!response.ok || !result?.success) {

      const message =
        result?.error ||
        `Analytics request failed with HTTP ${response.status}.`;

      throw new Error(message);
    }

    return result;
  }
};

function normalizeAnalyticsData(result) {

  const overview =
    result?.overview || {};

  const traffic =
    Array.isArray(result?.traffic)
      ? result.traffic
      : [];

  const topPages =
    Array.isArray(result?.topPages)
      ? result.topPages
      : [];

  const countries =
    Array.isArray(result?.countries)
      ? result.countries
      : [];

  const devices =
    Array.isArray(result?.devices)
      ? result.devices
      : [];

  const referrers =
    Array.isArray(result?.referrers)
      ? result.referrers
      : [];


  /*
   * Convert the Worker response into the structure
   * expected by the existing dashboard renderer.
   */

  const pageviews =
    Number(overview.pageViews) || 0;

  const visitors =
    Number(overview.visitors) || 0;

  const sessions =
    Number(overview.visits) || 0;


  /*
   * Traffic sources
   */

  const totalReferrerViews =
    referrers.reduce(
      (total, item) =>
        total +
        (Number(item.pageViews) || 0),
      0
    );

  const trafficSources =
    referrers.map(item => {

      const views =
        Number(item.pageViews) || 0;

      return {

        name:
          item.name ||
          "Direct / Unknown",

        sessions:
          Number(item.visits) || views,

        percentage:
          totalReferrerViews > 0
            ? (views / totalReferrerViews) * 100
            : 0

      };

    });


  /*
   * Device breakdown
   */

  const totalDeviceViews =
    devices.reduce(
      (total, item) =>
        total +
        (Number(item.pageViews) || 0),
      0
    );

  const deviceBreakdown =
    devices.map(item => {

      const views =
        Number(item.pageViews) || 0;

      return {

        name:
          item.name ||
          "Unknown",

        percentage:
          totalDeviceViews > 0
            ? (views / totalDeviceViews) * 100
            : 0

      };

    });


  /*
   * Top pages
   */

  const normalizedPages =
    topPages.map(page => ({

      title:
        page.name ||
        page.path ||
        "Unknown page",

      path:
        page.name ||
        page.path ||
        "",

      views:
        Number(page.pageViews) || 0

    }));


  /*
   * Traffic chart
   *
   * The Worker currently returns pageViews,
   * while the old dashboard chart expects visitors.
   *
   * Until Cloudflare provides a reliable unique-visitor
   * metric for this RUM dataset, use pageViews here
   * rather than inventing visitor numbers.
   */

  const normalizedTraffic =
    traffic.map(point => ({

      date:
        point.date,

      visitors:
        Number(point.pageViews) || 0,

      pageViews:
        Number(point.pageViews) || 0,

      visits:
        Number(point.visits) || 0

    }));


  /*
   * Recent activity
   */

  const recentActivity =
    traffic
      .slice(-5)
      .reverse()
      .map(point => ({

        title:
          "Website traffic",

        detail:
          `${formatNumber(point.pageViews)} page views`,

        time:
          point.date || ""

      }));


  return {

    metrics: {

      visitors,

      pageviews,

      sessions,

      /*
       * These metrics are not currently supplied
       * by the Worker, so do not invent them.
       */

      bounceRate: null,

      averageSessionDuration: null,

      newVisitors: null

    },

    traffic:
      normalizedTraffic,

    topPages:
      normalizedPages,

    trafficSources:
      trafficSources,

    devices:
      deviceBreakdown,

    recentActivity:
      recentActivity,

    health: [],

    countries:
      countries

  };

}

/* =========================================================
   FORMATTERS
========================================================= */

function formatNumber(value) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(number);
}


function formatPercentage(value) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "—";
  }

  return `${number.toFixed(1)}%`;
}


function formatLastUpdated(date) {

  if (!(date instanceof Date)) {
    return "Not updated yet";
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
   HTML ESCAPING
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
   LAST UPDATED
========================================================= */

function updateLastUpdated() {

  const element =
    $("#lastUpdated");

  if (!element) {
    return;
  }

  if (!dashboardState.lastUpdated) {
    element.textContent =
      "Not updated yet";

    return;
  }

  element.textContent =
    formatLastUpdated(
      dashboardState.lastUpdated
    );
}


/* =========================================================
   CONNECTION STATUS
========================================================= */

function updateAnalyticsConnection(
  connected
) {

  const status =
    $("#analyticsStatus");

  if (!status) {
    return;
  }

  status.classList.toggle(
    "connected",
    connected
  );

  status.classList.toggle(
    "disconnected",
    !connected
  );

  status.textContent =
    connected
      ? "Connected"
      : "Not connected";
}


/* =========================================================
   DATE RANGE
========================================================= */

function getSelectedRange() {

  const select =
    $("#dashboardDateRange");

  if (!select) {
    return dashboardState.period;
  }

  return (
    select.value ||
    "30d"
  );
}


/* =========================================================
   STATISTICS
========================================================= */

function renderOverview(data) {

  const overview =
    data?.overview || {};

  const pageViews =
    Number(
      overview.pageViews
    ) || 0;

  const visits =
    Number(
      overview.visits
    ) || 0;

  const visitors =
    Number(
      overview.visitors
    ) || 0;


  const visitorsElement =
    $("#statVisitors");

  if (visitorsElement) {
    visitorsElement.textContent =
      formatNumber(visitors);
  }


  const pageViewsElement =
    $("#statPageViews");

  if (pageViewsElement) {
    pageViewsElement.textContent =
      formatNumber(pageViews);
  }


  const sessionsElement =
    $("#statSessions");

  if (sessionsElement) {
    sessionsElement.textContent =
      formatNumber(visits);
  }


  /*
   * Cloudflare RUM pageload data currently supplied by
   * the Worker does not provide a reliable engagement
   * duration metric.
   *
   * Therefore we intentionally do NOT invent a value.
   */

  const engagementElement =
    $("#statEngagement");

  if (engagementElement) {
    engagementElement.textContent =
      "—";
  }


  /*
   * Leads are handled separately by the contact system.
   * Analytics should not fabricate enquiry counts.
   */

  const leadsElement =
    $("#statLeads");

  if (leadsElement) {
    leadsElement.textContent =
      "—";
  }


  /*
   * Conversion requires real enquiry data.
   */

  const conversionElement =
    $("#statConversion");

  if (conversionElement) {
    conversionElement.textContent =
      "—";
  }


  const visitorChange =
    $("#statVisitorsChange");

  if (visitorChange) {
    visitorChange.textContent =
      "—";
  }
}


/* =========================================================
   TRAFFIC CHART
========================================================= */

function renderTrafficChart(data) {

  const container =
    $("#trafficChart");

  if (!container) {
    return;
  }

  const points =
    Array.isArray(data?.traffic)
      ? data.traffic
      : [];


  if (!points.length) {

    container.innerHTML = `
      <div class="dashboard-chart-empty">
        <span>No traffic data</span>
        <small>
          No analytics data is available for this period.
        </small>
      </div>
    `;

    return;
  }


  /*
   * Use a simple dependency-free SVG chart.
   * This avoids requiring Chart.js or another library.
   */

  const width = 900;
  const height = 300;

  const padding = 35;

  const values =
    points.map(
      point =>
        Number(
          point.pageViews
        ) || 0
    );

  const maxValue =
    Math.max(
      ...values,
      1
    );


  const chartWidth =
    width -
    padding * 2;

  const chartHeight =
    height -
    padding * 2;


  const coordinates =
    points.map(
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
            point.pageViews
          ) || 0;

        const y =
          height -
          padding -
          (
            value /
            maxValue
          ) *
          chartHeight;

        return {
          x,
          y,
          value,
          date:
            point.date || ""
        };
      }
    );


  const path =
    coordinates
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");


  const areaPath =
    `${path}
     L ${coordinates.at(-1).x} ${height - padding}
     L ${coordinates[0].x} ${height - padding}
     Z`;


  const pointsHTML =
    coordinates
      .map(
        point => `
          <circle
            cx="${point.x}"
            cy="${point.y}"
            r="3"
            class="dashboard-chart-point"
          >
            <title>
              ${escapeHTML(point.date)}:
              ${formatNumber(point.value)} page views
            </title>
          </circle>
        `
      )
      .join("");


  container.innerHTML = `
    <svg
      class="dashboard-traffic-svg"
      viewBox="0 0 ${width} ${height}"
      role="img"
      aria-label="Website page views over time"
      preserveAspectRatio="none"
    >

      <path
        d="${areaPath}"
        class="dashboard-chart-area"
      ></path>

      <path
        d="${path}"
        class="dashboard-chart-line"
        fill="none"
      ></path>

      ${pointsHTML}

    </svg>
  `;
}


/* =========================================================
   TRAFFIC SOURCES
========================================================= */

function renderTrafficSources(data) {

  const container =
    $("#trafficSources");

  if (!container) {
    return;
  }


  const sources =
    Array.isArray(
      data?.referrers
    )
      ? data.referrers
      : [];


  if (!sources.length) {

    container.innerHTML = `
      <div class="dashboard-empty-state compact">
        <span class="empty-icon">↗</span>

        <strong>
          No traffic sources yet
        </strong>

        <small>
          Referrer information will appear here.
        </small>
      </div>
    `;

    return;
  }


  const total =
    sources.reduce(
      (
        sum,
        source
      ) =>
        sum +
        (
          Number(
            source.pageViews
          ) || 0
        ),
      0
    );


  container.innerHTML =
    sources
      .slice(0, 8)
      .map(
        source => {

          const views =
            Number(
              source.pageViews
            ) || 0;

          const percentage =
            total > 0
              ? (
                  views /
                  total
                ) *
                100
              : 0;

          return `
            <div class="dashboard-list-row">

              <div>
                <strong>
                  ${escapeHTML(
                    source.name ||
                    "Direct / Unknown"
                  )}
                </strong>

                <span>
                  ${formatPercentage(
                    percentage
                  )}
                </span>
              </div>

              <b>
                ${formatNumber(views)}
              </b>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   TOP PAGES
========================================================= */

function renderTopPages(data) {

  const table =
    $("#topPagesTable");

  if (!table) {
    return;
  }


  const pages =
    Array.isArray(
      data?.topPages
    )
      ? data.topPages
      : [];


  if (!pages.length) {

    table.innerHTML = `
      <tr class="dashboard-table-empty">

        <td colspan="5">

          <div class="dashboard-empty-state">

            <span class="empty-icon">
              ▤
            </span>

            <strong>
              No page analytics available
            </strong>

            <small>
              No pages were recorded for this period.
            </small>

          </div>

        </td>

      </tr>
    `;

    return;
  }


  table.innerHTML =
    pages
      .slice(0, 20)
      .map(
        page => {

          const pageViews =
            Number(
              page.pageViews
            ) || 0;

          const visits =
            Number(
              page.visits
            ) || 0;


          return `
            <tr>

              <td>
                <strong>
                  ${escapeHTML(
                    page.name ||
                    "/"
                  )}
                </strong>
              </td>

              <td>
                ${formatNumber(
                  pageViews
                )}
              </td>

              <td>
                ${formatNumber(
                  visits
                )}
              </td>

              <td>
                —
              </td>

              <td>
                <span class="health-badge good">
                  Live
                </span>
              </td>

            </tr>
          `;
        }
      )
      .join("");
}


/* =========================================================
   HEALTH / ANALYTICS CONNECTION
========================================================= */

function renderAnalyticsHealth(
  connected
) {

  const monitoringStatus =
    $("#monitoringStatus");

  if (
    monitoringStatus &&
    connected
  ) {

    monitoringStatus.classList.remove(
      "disconnected"
    );

    monitoringStatus.classList.add(
      "connected"
    );

    monitoringStatus.textContent =
      "Analytics online";
  }


  /*
   * Analytics data itself is not a substitute for a
   * complete website health scan, so we leave the actual
   * health checks untouched.
   */
}


/* =========================================================
   EMPTY / ERROR UI
========================================================= */

function showDashboardMessage(
  type,
  message
) {

  /*
   * This dashboard HTML does not contain dedicated
   * loading/error containers, so use a small toast.
   */

  const toast =
    $("#dashboardToast");

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  if (type === "error") {
    toast.classList.add(
      "error"
    );
  } else {
    toast.classList.remove(
      "error"
    );
  }


  window.clearTimeout(
    showDashboardMessage.timeout
  );

  showDashboardMessage.timeout =
    window.setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      4000
    );
}


/* =========================================================
   RENDER COMPLETE DASHBOARD
========================================================= */

function renderDashboard(
  data
) {

  dashboardState.data =
    data;

  dashboardState.lastUpdated =
    new Date();

  updateAnalyticsConnection(
    true
  );

  renderOverview(
    data
  );

  renderTrafficChart(
    data
  );

  renderTrafficSources(
    data
  );

  renderTopPages(
    data
  );

  renderAnalyticsHealth(
    true
  );

  updateLastUpdated();
}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

  if (
    dashboardState.loading
  ) {
    return;
  }


  dashboardState.loading =
    true;

  dashboardState.error =
    null;


  const refreshButton =
    $("#dashboardRefresh");

  if (refreshButton) {

    refreshButton.disabled =
      true;

    refreshButton.setAttribute(
      "aria-busy",
      "true"
    );
  }


  try {

    const range =
      getSelectedRange();

    dashboardState.period =
      range;


    const data =
      await AnalyticsAdapter
        .getDashboardData(
          range
        );


    renderDashboard(
      data
    );


    showDashboardMessage(
      "success",
      "Analytics updated."
    );


  } catch (error) {

    console.error(
      "Webcraft analytics error:",
      error
    );


    dashboardState.error =
      error;


    updateAnalyticsConnection(
      false
    );


    showDashboardMessage(
      "error",
      error?.message ||
      "Unable to load analytics."
    );


  } finally {

    dashboardState.loading =
      false;


    if (refreshButton) {

      refreshButton.disabled =
        false;

      refreshButton.removeAttribute(
        "aria-busy"
      );
    }
  }
}


/* =========================================================
   DATE RANGE CONTROL
========================================================= */

function initDateRange() {

  const select =
    $("#dashboardDateRange");

  if (!select) {
    return;
  }


  select.addEventListener(
    "change",
    () => {

      dashboardState.period =
        select.value;

      loadDashboard();
    }
  );
}


/* =========================================================
   REFRESH BUTTON
========================================================= */

function initRefreshButton() {

  const button =
    $("#dashboardRefresh");

  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      loadDashboard();
    }
  );
}


/* =========================================================
   SIDEBAR MOBILE MENU
========================================================= */

function initMobileMenu() {

  const button =
    $("#dashboardMenuToggle");

  const sidebar =
    $("#dashboardSidebar");

  const overlay =
    $("#dashboardOverlay");


  if (
    !button ||
    !sidebar
  ) {
    return;
  }


  function closeMenu() {

    sidebar.classList.remove(
      "open"
    );

    if (overlay) {

      overlay.classList.remove(
        "open"
      );

      overlay.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }


  function openMenu() {

    sidebar.classList.add(
      "open"
    );

    if (overlay) {

      overlay.classList.add(
        "open"
      );

      overlay.setAttribute(
        "aria-hidden",
        "false"
      );
    }

    button.setAttribute(
      "aria-expanded",
      "true"
    );
  }


  button.addEventListener(
    "click",
    () => {

      const open =
        sidebar.classList.contains(
          "open"
        );

      if (open) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  );


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeMenu
    );
  }


  $$(".dashboard-nav-link")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          closeMenu
        );
      }
    );
}


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

function initNavigation() {

  const links =
    $$(".dashboard-nav-link");

  if (!links.length) {
    return;
  }


  function updateActiveLink() {

    const hash =
      window.location.hash ||
      "#overview";


    links.forEach(
      link => {

        const href =
          link.getAttribute(
            "href"
          );

        const active =
          href === hash;

        link.classList.toggle(
          "active",
          active
        );

        if (active) {

          link.setAttribute(
            "aria-current",
            "page"
          );

        } else {

          link.removeAttribute(
            "aria-current"
          );
        }
      }
    );
  }


  window.addEventListener(
    "hashchange",
    updateActiveLink
  );


  updateActiveLink();
}


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

function initKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    event => {

      const active =
        document.activeElement;


      const isTyping =
        active &&
        (
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT"
        );


      if (
        event.key.toLowerCase() === "r" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isTyping
      ) {

        loadDashboard();
      }
    }
  );
}


/* =========================================================
   AUTO REFRESH
========================================================= */

function initAutoRefresh() {

  window.setInterval(
    () => {

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
   YEAR
========================================================= */

function initYear() {

  const year =
    $("#dashboardYear");

  if (!year) {
    return;
  }

  year.textContent =
    String(
      new Date().getFullYear()
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

function initDashboard() {

  /*
   * Only initialize on the dashboard page.
   */

  if (
    !$(".dashboard-shell")
  ) {
    return;
  }


  initDateRange();

  initRefreshButton();

  initMobileMenu();

  initNavigation();

  initKeyboardShortcuts();

  initYear();

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
