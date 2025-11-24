// /js/consent.js
// Final single-file consent manager with strong glass UI, GDPR/CCPA detection, GA4 blocking.
// Replace GA_ID with your GA4 measurement ID.
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "alethra_cookie_consent_v1";
  const GA_ID = "G-XXXXXXX"; // <-- REPLACE with your GA4 measurement ID
  const GEO_API = "https://ipapi.co/json/"; // fallback IP geolocation

  // -------------------------
  // Create wrapper + panel
  // -------------------------
  const wrapper = document.createElement("div");
  wrapper.id = "cookie-consent-wrapper";
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "999999",
    pointerEvents: "none" // keep page interactive
  });
  document.body.appendChild(wrapper);

  const panel = document.createElement("aside");
  panel.id = "cookie-consent-panel";
  Object.assign(panel.style, {
    position: "absolute",
    left: "0",
    bottom: "0",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    transform: "translateX(-100%)",
    transition: "transform 0.45s cubic-bezier(.4,0,.2,1), height 0.32s ease",
    height: "auto",    // compact initially
    maxHeight: "100vh",
    overflowY: "auto",
    padding: "20px 20px 12px 16px",
    pointerEvents: "all",

    // Strong glass
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(30px) saturate(140%)",
    WebkitBackdropFilter: "blur(30px) saturate(140%)",

    borderLeft: "1px solid rgba(255,255,255,0.06)",
    borderRight: "none"
  });
  wrapper.appendChild(panel);

  // Inject CSS
  const css = document.createElement("style");
  css.textContent = `
    #cookie-consent-panel * { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, sans-serif; }
    #cookie-consent-panel h2 { margin:0; font-size:20px; font-weight:600; color: #0b1220; }
    #cookie-consent-panel p { margin:8px 0 0 0; font-size:13px; color: #333; line-height:1.35; }
    #cookie-consent-panel .actions { margin-top:14px; display:flex; flex-direction:column; gap:10px; }
    #cookie-consent-panel .btn-primary {
      width:100%; background:#C8102E; color:#fff; border:0; padding:11px; font-size:14px; font-weight:600; cursor:pointer; border-radius:10px;
      transition: transform .12s ease, opacity .12s ease;
    }
    #cookie-consent-panel .btn-secondary {
      width:100%; background: rgba(0,0,0,0.04); color:#111; border:0; padding:10px; font-size:14px; font-weight:600; cursor:pointer; border-radius:10px;
    }
    #cookie-consent-panel .btn-close {
      background: none; border: none; font-size:22px; color:#444; cursor:pointer; padding:6px;
    }

    #cookie-consent-panel .btn-manage {
      display:inline-block; margin-top:8px; padding:8px 12px; font-size:13px; color:#C8102E; text-decoration:none; border-radius:999px;
      border: 1px solid rgba(200,16,46,0.12); cursor:pointer;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
      transition: transform .12s ease, box-shadow .12s ease;
      align-self: start;
      margin-bottom: 12px;
    }
    #cookie-consent-panel .btn-manage:hover { transform: translateY(-2px); }

    #cookie-consent-panel .category { margin-top:16px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
    #cookie-consent-panel .category .meta { max-width:74%; }
    #cookie-consent-panel .category .meta .title { font-weight:600; color:#0b1220; }
    #cookie-consent-panel .category .meta .desc { font-size:12px; color:#6b6f76; margin-top:6px; }

    .ac-toggle { position: relative; display: inline-block; width:44px; height:24px; }
    .ac-toggle input { display: none; }
    .ac-slider { position: absolute; cursor: pointer; top:0; left:0; right:0; bottom:0; background:#d1d5db; border-radius:20px; transition:.22s; }
    .ac-slider:before { content: ""; position: absolute; height:18px; width:18px; left:3px; bottom:3px; background:#fff; border-radius:50%; transition:.22s; }
    .ac-toggle input:checked + .ac-slider { background:#C8102E; }
    .ac-toggle input:checked + .ac-slider:before { transform: translateX(20px); }

    #cookie-consent-panel .save-wrap { padding-bottom:18px; }

    @media (max-width:520px) {
      #cookie-consent-panel { max-width: 100vw; width: 100vw; padding-left:12px; padding-right:12px; }
      #cookie-consent-panel .btn-manage { margin-left: 0; }
    }
  `;
  document.head.appendChild(css);

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.setAttribute("aria-label", "Close cookie settings");
  closeBtn.className = "btn-close";
  closeBtn.innerText = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "10px",
    right: "10px"
  });
  panel.appendChild(closeBtn);

  // Content container
  const content = document.createElement("div");
  content.id = "cookie-content";
  content.style.padding = "16px 20px 12px 16px";
  panel.appendChild(content);

  // Basic HTML
  const basicHTML = `
    <h2>Cookies on This Site</h2>
    <p style="margin-top:8px;">
      We use cookies to improve performance, measure usage, and personalize your experience.
      Accept all, reject non-essential, or manage preferences.
    </p>

    <div class="actions">
      <button id="consent-accept" class="btn-primary" type="button">Accept All</button>
      <button id="consent-reject" class="btn-secondary" type="button">Reject</button>
      <button id="consent-manage" class="btn-manage" type="button">Manage Cookies</button>
    </div>
  `;

  // Detailed HTML
  const detailedHTML = `
    <h2>Manage Cookies</h2>
    <p style="margin-top:8px;">
      Enable or disable specific categories. Essential cookies are required for the site to function.
    </p>

    <div id="cookie-categories" style="margin-top:18px;">
      <div class="category">
        <div class="meta">
          <div class="title">Essential Cookies</div>
          <div class="desc">Required for core functionality: sessions, security and localization. Cannot be disabled.</div>
        </div>
        <div style="align-self:center;"><span style="font-size:12px;color:#6b6f76">Always on</span></div>
      </div>

      <div class="category">
        <div class="meta">
          <div class="title">Analytics</div>
          <div class="desc">Anonymous usage metrics to improve product experience.</div>
        </div>
        <label class="ac-toggle">
          <input id="toggle-analytics" type="checkbox">
          <span class="ac-slider"></span>
        </label>
      </div>

      <div class="category">
        <div class="meta">
          <div class="title">Performance</div>
          <div class="desc">Rendering and speed metrics to improve reliability.</div>
        </div>
        <label class="ac-toggle">
          <input id="toggle-performance" type="checkbox">
          <span class="ac-slider"></span>
        </label>
      </div>

      <div class="category">
        <div class="meta">
          <div class="title">Marketing</div>
          <div class="desc">Campaign effectiveness and messaging personalization.</div>
        </div>
        <label class="ac-toggle">
          <input id="toggle-marketing" type="checkbox">
          <span class="ac-slider"></span>
        </label>
      </div>

      <div class="save-wrap" style="margin-top:18px;">
        <button id="consent-save" class="btn-primary" type="button">Save Preferences</button>
      </div>
    </div>
  `;

  // Load basic view
  content.innerHTML = basicHTML;

  // Slide in
  setTimeout(() => { panel.style.transform = "translateX(0)"; }, 40);

  // -------------------------
  // Region detection
  // -------------------------
  let regionMode = "GLOBAL";

  function detectRegionThenInit() {
    fetch(GEO_API, { cache: "no-store" })
      .then(r => r.json())
      .then(loc => {
        const eu = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];
        if (loc && loc.country) {
          if (eu.includes((loc.country).toUpperCase())) regionMode = "GDPR";
          else if (loc.country_code === "US" && loc.region_code === "CA") regionMode = "CCPA";
          else regionMode = "GLOBAL";
        }
      })
      .catch(() => {})
      .finally(() => applyRegionDefaults());
  }

  function applyRegionDefaults() {
    const saved = getSavedConsent();
    if (saved && saved.analytics) loadGA();
  }

  // -------------------------
  // Consent storage
  // -------------------------
  function saveConsent(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch(e) {}

    fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ consent: obj, region: regionMode, ts: new Date().toISOString() })
    }).catch(()=>{});

    if (obj.analytics) loadGA();
  }

  function getSavedConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
  }

  // -------------------------
  // GA loader
  // -------------------------
  function loadGA() {
    if (!GA_ID || GA_ID === "G-XXXXXXX") return;
    if (window.__alethra_ga_loaded) return;

    window.__alethra_ga_loaded = true;

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    const i = document.createElement("script");
    i.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { 'anonymize_ip': true });
    `;
    document.head.appendChild(i);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };

  // -------------------------
  // Initial check
  // -------------------------
  const existing = getSavedConsent();
  if (existing) {
    wrapper.style.display = "none";
    if (existing.analytics) loadGA();
    return;
  }

  // -------------------------
  // Wire basic view
  // -------------------------
  function wireBasicEvents() {
    document.getElementById("consent-accept").addEventListener("click", () => {
      saveConsent({ essential:true, analytics:true, performance:true, marketing:true });
      hidePanel();
    });

    document.getElementById("consent-reject").addEventListener("click", () => {
      saveConsent({ essential:true, analytics:false, performance:false, marketing:false });
      hidePanel();
    });

    document.getElementById("consent-manage").addEventListener("click", () => {

      // ❤️ UPDATED: dynamic height (no forced 100vh)
      panel.style.height = "auto";
      panel.style.maxHeight = "100vh";
      panel.style.overflowY = "auto";

      content.innerHTML = detailedHTML;
      wireDetailEvents();

      const saved = getSavedConsent();
      const analyticsEl = document.getElementById("toggle-analytics");
      const perfEl = document.getElementById("toggle-performance");
      const mktEl = document.getElementById("toggle-marketing");

      if (saved) {
        analyticsEl.checked = !!saved.analytics;
        perfEl.checked = !!saved.performance;
        mktEl.checked = !!saved.marketing;
      } else {
        const def = regionMode === "GDPR" ? false : true;
        analyticsEl.checked = def;
        perfEl.checked = def;
        mktEl.checked = def;
      }
    });
  }

  function wireDetailEvents() {
    document.getElementById("consent-save").addEventListener("click", () => {
      saveConsent({
        essential:true,
        analytics: document.getElementById("toggle-analytics").checked,
        performance: document.getElementById("toggle-performance").checked,
        marketing: document.getElementById("toggle-marketing").checked
      });
      hidePanel();
    });

    const close = panel.querySelector(".btn-close");
    if (close) close.addEventListener("click", hidePanel);
  }

  function hidePanel() {
    panel.style.transform = "translateX(-100%)";
    setTimeout(() => wrapper.style.display = "none", 380);
  }

  wireBasicEvents();

  const close = panel.querySelector(".btn-close");
  if (close) close.addEventListener("click", hidePanel);

  detectRegionThenInit();
});
