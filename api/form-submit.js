export const config = { runtime: "edge" };

/**
 * form-submit.js
 * - Durable rate-limiting using Upstash REST (IP + Email)
 * - Honeypot + timing checks for additional spam protection
 * - Multi-form routing / Postmark sending
 *
 * Env:
 * - POSTMARK_TOKEN (required)
 * - UPSTASH_REST_URL (optional, e.g. https://us1-merry-cat-32748.upstash.io)
 * - UPSTASH_REST_TOKEN (optional) - Authorization Bearer for Upstash
 *
 * Limits (configurable below):
 * - MAX_IP_PER_HOUR = 10
 * - MAX_EMAIL_PER_DAY = 3
 */

const MAX_IP_PER_HOUR = 100;
const IP_WINDOW_SECONDS = 60 * 60; // 1 hour

const MAX_EMAIL_PER_DAY = 300;
const EMAIL_WINDOW_SECONDS = 60 * 60 * 24; // 24 hours

const UPSTASH_URL = process.env.UPSTASH_REST_URL || null;
const UPSTASH_TOKEN = process.env.UPSTASH_REST_TOKEN || null;

const FORM_CONFIG = {
  // Example forms. Add yours or modify as needed.
  "main-form": {
    internalTo: "orlando@myalethra.com",
    internalSubject: "New Join Movement Submission",
    userSubject: "Welcome to ALETHRA Movement",
    userText: "Thank you for joining the movement!",
    userHtml: "<p>Thank you for joining the movement!</p>",
  },
  // add other form-id entries...
};

async function upstashIncrWithExpire(key, expireSeconds) {
  // Returns integer new value, or throws on error
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error("Upstash not configured");
  // `INCR key`
  const incrUrl = `${UPSTASH_URL}/incr/${encodeURIComponent(key)}`;
  const res = await fetch(incrUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Upstash INCR failed: ${res.status} ${errTxt}`);
  }
  const json = await res.json();
  const val = json.result;
  // If this is the first increment, set expire
  if (val === 1) {
    const expireUrl = `${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${expireSeconds}`;
    const expRes = await fetch(expireUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    if (!expRes.ok) {
      // Not fatal: log and continue; value incremented but expire failed
      const txt = await expRes.text();
      console.warn("Upstash EXPIRE failed:", expRes.status, txt);
    }
  }
  return val;
}

// Simple helper to check and return whether Upstash is available
function upstashAvailable() {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sanitize(v) {
  return String(v || "")
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .replace(/<|>/g, "");
}

export default async function handler(req) {
  // Basic token checks
  if (!process.env.POSTMARK_TOKEN) {
    return jsonResponse({ ok: false, error: "Server email token missing" }, 500);
  }

  // Parse JSON
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ ok: false, error: "Malformed request" }, 400);
  }

  // ----- Honeypot check -----
  // Add <input name="hp" style="display:none"> to forms. Bots often fill it.
  if (body.hp && String(body.hp).trim() !== "") {
    console.warn("Honeypot triggered. Dropping submission.", { hp: body.hp });
    // Return generic success to confuse bots (optional) or 400.
    return jsonResponse({ ok: false, error: "Malformed request" }, 400);
  }

  // ----- Timing check -----
  // Optional: Add hidden timestamp field 'ts' with render time in ms (Date.now()).
  // If the form is submitted too fast (e.g. < 2s) it's likely bot.
  try {
    const ts = body.ts ? Number(body.ts) : null;
    if (ts) {
      const now = Date.now();
      const delta = now - ts;
      if (delta < 2000) {
        console.warn("Submission too fast (likely bot)", { delta });
        return jsonResponse({ ok: false, error: "Submission too fast" }, 400);
      }
      // Optional: reject if timestamp too old (>30 days)
      if (delta > 1000 * 60 * 60 * 24 * 30) {
        console.warn("Submission timestamp suspiciously old", { delta });
        return jsonResponse({ ok: false, error: "Malformed request" }, 400);
      }
    }
  } catch (e) {
    // non-fatal: continue
  }

  // ----- Basic field checks -----
  const formId = sanitize(body["form-id"] || "");
  const config = FORM_CONFIG[formId];
  if (!config) {
    return jsonResponse({ ok: false, error: "Unknown form-id" }, 400);
  }

  // Validate user email
  const userEmailRaw = body["official-email"] || "";
  const userEmail = String(userEmailRaw).trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userEmail || !emailRegex.test(userEmail)) {
    return jsonResponse({ ok: false, error: "Valid email required" }, 400);
  }

  // ----- Rate limiting (Upstash) -----
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown-ip";

  // if Upstash configured, use it for durable counters
  if (upstashAvailable()) {
    try {
      // 1) IP window counter
      const ipKey = `rl:ip:${clientIp.replace(/[:.]/g, "_")}`; // safe key
      const ipCount = await upstashIncrWithExpire(ipKey, IP_WINDOW_SECONDS);
      if (ipCount > MAX_IP_PER_HOUR) {
        console.warn("IP rate limit exceeded", { clientIp, ipCount });
        return jsonResponse(
          { ok: false, error: "Rate limit exceeded (IP). Try again later." },
          429
        );
      }

      // 2) Email per-day counter
      const emailKey = `rl:email:${encodeURIComponent(userEmail.toLowerCase())}`;
      const emailCount = await upstashIncrWithExpire(emailKey, EMAIL_WINDOW_SECONDS);
      if (emailCount > MAX_EMAIL_PER_DAY) {
        console.warn("Email rate limit exceeded", { userEmail, emailCount });
        return jsonResponse(
          { ok: false, error: "Rate limit exceeded (email). Try again later." },
          429
        );
      }
    } catch (err) {
      // If Upstash call fails, log it and continue to allow submission
      // Do NOT block for Upstash errors — otherwise availability degrades.
      console.error("Upstash error — allowing submission (fail-open):", err);
    }
  } else {
    // If Upstash not configured, we still have honeypot/timing checks.
    // Optionally, you could return 503 to force you to configure Upstash.
    console.warn("Upstash not configured — rate limiting is best-effort (honeypot+timing only)");
  }

  // ----- Sanitize and format the submitted fields -----
  const safeData = {};
  for (const [k, v] of Object.entries(body)) {
    if (Array.isArray(v)) safeData[k] = v.map((i) => sanitize(i));
    else safeData[k] = sanitize(v);
  }

  const textBody = Object.entries(safeData)
    .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`))
    .join("\n");

  const htmlBody =
    `<h2>New Form Submission: ${formId}</h2><ul>` +
    Object.entries(safeData)
      .map(([k, v]) => `<li><strong>${k}:</strong> ${Array.isArray(v) ? v.join(", ") : v}</li>`)
      .join("") +
    `</ul>`;

  const clientUa = req.headers.get("user-agent") || "unknown";
  const metaText = `\n\n---\nIP: ${clientIp}\nUser-Agent: ${clientUa}`;
  const metaHtml = `<hr><p>IP: ${clientIp}<br>User-Agent: ${clientUa}</p>`;

  // ----- Send internal email to form owner -----
  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: "info@myalethra.com",
        To: config.internalTo,
        Subject: config.internalSubject || `New Form: ${formId}`,
        TextBody: textBody + metaText,
        HtmlBody: htmlBody + metaHtml,
        MessageStream: "outbound",
      }),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error("Postmark internal error:", res.status, errTxt);
      return jsonResponse({ ok: false, error: "Internal email failed" }, 500);
    }
  } catch (err) {
    console.error("Postmark internal fetch error:", err);
    return jsonResponse({ ok: false, error: "Internal email failed" }, 500);
  }

  // ----- Send confirmation email to user (best-effort) -----
  try {
    const res2 = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: "info@myalethra.com",
        To: userEmail,
        Subject: config.userSubject || "Thanks — we received your submission",
        TextBody: config.userText || "Thanks for contacting us. We'll be in touch soon.",
        HtmlBody: config.userHtml || "<p>Thanks — we received your submission and will contact you soon.</p>",
        MessageStream: "outbound",
      }),
    });

    if (!res2.ok) {
      const errTxt = await res2.text();
      console.warn("Postmark user confirmation non-ok:", res2.status, errTxt);
      // do not fail the response
    }
  } catch (err) {
    console.warn("Postmark user confirmation error:", err);
  }

  // Optionally: fire-and-forget CRM sync / analytics here (keepalive)
  // Example:
  try {
    // best-effort: use sendBeacon when available (frontend); here it's server-side, so use fetch but non-blocking.
    // If you have a CRM endpoint, post to it. For now, we skip blocking calls.
  } catch (e) {
    // ignore
  }

  return jsonResponse({ ok: true }, 200);
}
