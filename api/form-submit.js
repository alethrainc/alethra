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
 */

const MAX_IP_PER_HOUR = 100;
const IP_WINDOW_SECONDS = 60 * 60;

const MAX_EMAIL_PER_DAY = 300;
const EMAIL_WINDOW_SECONDS = 60 * 60 * 24;

const UPSTASH_URL = process.env.UPSTASH_REST_URL || null;
const UPSTASH_TOKEN = process.env.UPSTASH_REST_TOKEN || null;

/* ---------------------------------------------------
   GLOBAL USER-FACING TEMPLATE (keeps your existing look)
---------------------------------------------------- */
const BASE_EMAIL_TEMPLATE = (content) => `
<table width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" 
  style="padding:40px 0; font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table width="600" cellspacing="0" cellpadding="0" 
      style="border-radius:16px; border:1px solid #f0f0f0; overflow:hidden;">
      <tr>
        <td align="center" style="padding:40px 20px 20px;">
          <h1 style="margin:0; font-size:26px; font-weight:700; color:#111;">ALETHRA™</h1>
          <p style="margin:6px 0 0; font-size:14px; color:#777;">Global Clarity</p>
        </td>
      </tr>

      <tr><td style="padding:0 40px;">
        <div style="height:1px; background:#eee; width:100%; margin:20px 0;"></div>
      </td></tr>

      <tr>
        <td style="padding:0 40px 30px; color:#333; font-size:16px; line-height:1.6;">
          ${content}
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:10px 40px 40px;">
          <a href="https://myalethra.com" 
             style="display:inline-block; padding:14px 32px; background:#111; 
             color:#fff; text-decoration:none; font-size:16px; font-weight:600; 
             border-radius:8px;">
            Visit ALETHRA™
          </a>
        </td>
      </tr>

      <tr>
        <td align="center" style="background:#fafafa; padding:20px; font-size:12px; color:#aaa;">
          © ALETHRA™. All rights reserved.
        </td>
      </tr>
    </table>
  </td></tr>
</table>
`;

/* ---------------------------------------------------
   NEW ENTERPRISE INTERNAL EMAIL TEMPLATE
---------------------------------------------------- */
function internalEmailTemplate({ formId, fieldsHtml, clientIp, userAgent }) {
  return `
<table width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" 
  style="padding:40px 0; font-family:Arial,Helvetica,sans-serif; background:#ffffff;">
  <tr><td align="center">
    <table width="600" cellspacing="0" cellpadding="0" 
      style="border-radius:16px; border:1px solid #f0f0f0; overflow:hidden; background:#ffffff;">

      <!-- Header -->
      <tr>
        <td align="center" style="padding:40px 20px 20px; background:#ffffff;">
          <h1 style="margin:0; font-size:26px; font-weight:700; color:#111;">ALETHRA™</h1>
          <p style="margin:6px 0 0; font-size:14px; color:#777;">Internal Submission Report</p>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 40px; background:#ffffff;">
          <div style="height:1px; background:#eee; width:100%; margin:20px 0;"></div>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding:0 40px 30px; color:#333; font-size:16px; line-height:1.6; background:#ffffff;">

          <p style="margin:0 0 20px;">
            <strong style="font-size:18px;">New Form Submission</strong><br>
            <span style="color:#555;">Form ID:</span>
            <strong>${formId}</strong>
          </p>

          <h3 style="font-size:16px; margin:30px 0 12px; color:#111;">Submitted Fields</h3>

          <ul style="list-style:none; padding:0; margin:0; font-size:15px; line-height:1.7;">
            ${fieldsHtml}
          </ul>

          <h3 style="font-size:16px; margin:30px 0 12px; color:#111;">Metadata</h3>
          <p style="margin:0; font-size:14px; color:#555; line-height:1.6;">
            <strong>Client IP:</strong> ${clientIp}<br>
            <strong>User-Agent:</strong> ${userAgent}
          </p>

        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding:10px 40px 40px; background:#ffffff;">
          <a href="https://myalethra.com"
             style="display:inline-block; padding:14px 32px; background:#111;
             color:#fff; text-decoration:none; font-size:16px; font-weight:600;
             border-radius:8px;">
            Open Dashboard
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="background:#ffffff; padding:20px; font-size:12px; color:#aaa;">
          © ALETHRA™ Internal — Confidential
        </td>
      </tr>

    </table>
  </td></tr>
</table>
`;
}


/* ---------------------------------------------------
   FORM CONFIG
---------------------------------------------------- */
const FORM_CONFIG = {
  "main-form": {
    internalTo: "orlando@myalethra.com",
    internalSubject: "New Join Movement Submission",
    userSubject: "Welcome to ALETHRA™ Movement",
    userText: "Thank you for joining the movement!",
    userHtml: BASE_EMAIL_TEMPLATE(`
      <p>Thank you for joining the ALETHRA™ movement.</p>
      <p>We’re excited to have you with us — this is the beginning of something powerful.</p>
    `),
  },
  "enterprise-request-form": {
    internalTo: "orlando@myalethra.com",
    internalSubject: "New Enterprise Submission",
    userSubject: "Welcome to ALETHRA™ Enterprise",
    userText: "Thank you for your Enterprise request!",
    userHtml: BASE_EMAIL_TEMPLATE(`
      <p>Thank you for joining ALETHRA™ Enterprise</p>
      <p>We’re excited to have you with us — this is the beginning of something powerful.</p>
    `),
  },
  "regulatory-request-form": {
    internalTo: "orlando@myalethra.com",
    internalSubject: "New Regulatory Submission",
    userSubject: "Welcome to ALETHRA™ Regulatory",
    userText: "Thank you for your Regulatory request!",
    userHtml: BASE_EMAIL_TEMPLATE(`
      <p>Thank you for joining ALETHRA™ Regulatory</p>
      <p>We’re excited to have you with us — this is the beginning of something powerful.</p>
    `),
  },
};

/* ---------------------------------------------------
   HELPERS
---------------------------------------------------- */
async function upstashIncrWithExpire(key, expireSeconds) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error("Upstash not configured");
  const incrUrl = `${UPSTASH_URL}/incr/${encodeURIComponent(key)}`;
  const res = await fetch(incrUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const json = await res.json();
  const val = json.result;
  if (val === 1) {
    const expireUrl = `${UPSTASH_URL}/expire/${encodeURIComponent(key)}/${expireSeconds}`;
    await fetch(expireUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
  }
  return val;
}

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

/* ---------------------------------------------------
   MAIN HANDLER
---------------------------------------------------- */
export default async function handler(req) {
  if (!process.env.POSTMARK_TOKEN)
    return jsonResponse({ ok: false, error: "Server email token missing" }, 500);

  // Parse JSON
  let body = {};
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body))
    return jsonResponse({ ok: false, error: "Malformed request" }, 400);

  // Honeypot
  if (body.hp && String(body.hp).trim() !== "")
    return jsonResponse({ ok: false, error: "Malformed request" }, 400);

  // Timing check
  try {
    const ts = body.ts ? Number(body.ts) : null;
    if (ts) {
      const delta = Date.now() - ts;
      if (delta < 2000) return jsonResponse({ ok: false, error: "Submission too fast" }, 400);
      if (delta > 1000 * 60 * 60 * 24 * 30)
        return jsonResponse({ ok: false, error: "Malformed request" }, 400);
    }
  } catch {}

  // Form ID
  const formId = sanitize(body["form-id"] || "");
  const config = FORM_CONFIG[formId];
  if (!config) return jsonResponse({ ok: false, error: "Unknown form-id" }, 400);

  // Validate user email
  const userEmail = String(body["official-email"] || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail))
    return jsonResponse({ ok: false, error: "Valid email required" }, 400);

  // Rate limiting
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown-ip";

  if (upstashAvailable()) {
    try {
      const ipKey = `rl:ip:${clientIp.replace(/[:.]/g, "_")}`;
      const ipCount = await upstashIncrWithExpire(ipKey, IP_WINDOW_SECONDS);
      if (ipCount > MAX_IP_PER_HOUR)
        return jsonResponse(
          { ok: false, error: "Rate limit exceeded (IP). Try again later." },
          429
        );

      const emailKey = `rl:email:${encodeURIComponent(userEmail.toLowerCase())}`;
      const emailCount = await upstashIncrWithExpire(emailKey, EMAIL_WINDOW_SECONDS);
      if (emailCount > MAX_EMAIL_PER_DAY)
        return jsonResponse(
          { ok: false, error: "Rate limit exceeded (email). Try again later." },
          429
        );
    } catch (err) {
      console.error("Upstash error — fail-open:", err);
    }
  }

  // Sanitize data
  const safeData = {};
  for (const [k, v] of Object.entries(body))
    safeData[k] = Array.isArray(v) ? v.map((i) => sanitize(i)) : sanitize(v);

  // Text fallback
  const textBody = Object.entries(safeData)
    .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`))
    .join("\n");

  // Build internal HTML fields
  const fieldsHtml = Object.entries(safeData)
    .map(
      ([k, v]) =>
        `<li style="margin-bottom:6px;"><strong>${k}:</strong> ${
          Array.isArray(v) ? v.join(", ") : v
        }</li>`
    )
    .join("");

  const clientUa = req.headers.get("user-agent") || "unknown";

  const internalHtml = internalEmailTemplate({
    formId,
    fieldsHtml,
    clientIp,
    userAgent: clientUa,
  });

  const metaText = `\n\n---\nIP: ${clientIp}\nUser-Agent: ${clientUa}`;

  // INTERNAL EMAIL SEND
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
        HtmlBody: internalHtml,
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

  // USER CONFIRMATION (soft fail)
  try {
    await fetch("https://api.postmarkapp.com/email", {
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
        HtmlBody:
          config.userHtml ||
          "<p>Thanks — we received your submission and will contact you soon.</p>",
        MessageStream: "outbound",
      }),
    });
  } catch (err) {
    console.warn("Postmark user confirmation error:", err);
  }

  return jsonResponse({ ok: true }, 200);
}
