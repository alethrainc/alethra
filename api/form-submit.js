export const config = { runtime: "edge" };

export default async function handler(req) {
  // ---------------------------
  // 0. Ensure Postmark Token Exists
  // ---------------------------
  if (!process.env.POSTMARK_TOKEN) {
    return new Response(
      JSON.stringify({ ok: false, error: "Server email token missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body = {};

  // ---------------------------
  // 1. Parse JSON safely
  // ---------------------------
  try {
    body = await req.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Block prototype pollution
  if (body.__proto__ || body.constructor !== Object) {
    return new Response(
      JSON.stringify({ ok: false, error: "Malformed request" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ---------------------------
  // 2. Required fields
  // ---------------------------
  const userEmail = (body["official-email"] || "").trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userEmail || !emailRegex.test(userEmail)) {
    return new Response(
      JSON.stringify({ ok: false, error: "A valid email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ---------------------------
  // 3. Normalize + sanitize fields
  // ---------------------------
  const escape = (v) =>
    String(v)
      .replace(/\r/g, "")
      .replace(/\n/g, " ")
      .replace(/<|>/g, "");

  const safeData = {};
  for (const [k, v] of Object.entries(body)) {
    if (Array.isArray(v)) safeData[k] = v.map((i) => escape(i));
    else safeData[k] = escape(v);
  }

  // ---------------------------
  // 4. Human-readable formatting
  // ---------------------------
  const textBody = Object.entries(safeData)
    .map(([k, v]) =>
      Array.isArray(v)
        ? `${k}: ${v.join(", ")}`
        : `${k}: ${v}`
    )
    .join("\n");

  const htmlBody =
    `<h2>New Alethra Website Form Submission</h2><ul>` +
    Object.entries(safeData)
      .map(([k, v]) =>
        `<li><strong>${k}:</strong> ${
          Array.isArray(v) ? v.join(", ") : v
        }</li>`
      )
      .join("") +
    `</ul>`;

  // System metadata
  const clientIp = req.headers.get("x-real-ip") || "Unknown IP";
  const ua = req.headers.get("user-agent") || "Unknown UA";

  const metaText = `\n\n---\nIP: ${clientIp}\nUser-Agent: ${ua}`;
  const metaHTML = `<hr><p>IP: ${clientIp}<br>User-Agent: ${ua}</p>`;

  // ---------------------------
  // 5. INTERNAL EMAIL
  // ---------------------------
  try {
    await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        From: "info@myalethra.com",
        To: "orlando@myalethra.com",
        Subject: "🔥 New ALETHRA Form Submission",
        TextBody: textBody + metaText,
        HtmlBody: htmlBody + metaHTML,
        MessageStream: "outbound",
      }),
    });
  } catch (err) {
    console.error("Internal email error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Internal email failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ---------------------------
  // 6. USER CONFIRMATION EMAIL
  // ---------------------------
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
        Subject: "Welcome to ALETHRA 🌿",
        TextBody:
          `Hi!\n\nThanks for joining ALETHRA.\nWe received your information and we’ll be in touch soon.\n\n— The Team`,
        HtmlBody:
          `<p>Hi!</p><p>Thanks for joining <strong>ALETHRA</strong>.</p><p>Your submission was received successfully and our team will contact you soon.</p><br><p>— The ALETHRA Team</p>`,
        MessageStream: "outbound",
      }),
    });
  } catch (err) {
    console.error("User confirmation email error:", err);
    // Silent fail — user still gets success response
  }

  // ---------------------------
  // 7. SUCCESS RESPONSE
  // ---------------------------
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
