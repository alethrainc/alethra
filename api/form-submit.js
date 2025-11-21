export const config = { runtime: "edge" };

export default async function handler(req) {
  let body = {};

  // Parse JSON safely
  try {
    body = await req.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate required field
  const userEmail = body["official-email"];
  if (!userEmail) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing official-email field" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Helper: format form fields nicely for internal email
  const formatField = (key, value) => {
    if (Array.isArray(value)) return `${key}: ${value.join(", ")}`;
    return `${key}: ${value}`;
  };

  const formattedBody = Object.entries(body)
    .map(([k, v]) => formatField(k, v))
    .join("\n");

  // ---- 1) INTERNAL EMAIL ----
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
        Subject: "New Website Form Submission",
        TextBody: formattedBody,
      }),
    });
  } catch (err) {
    console.error("Postmark internal email error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to send internal email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ---- 2) USER CONFIRMATION EMAIL ----
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
        Subject: "Thanks for joining ALETHRA",
        TextBody:
          "Hi there!\n\nThanks for signing up for ALETHRA. We received your information and will reach out soon with updates and community activities.\n\n— The ALETHRA Team",
      }),
    });
  } catch (err) {
    console.error("Postmark user email error:", err);
    // Don't fail the whole request if user email fails
  }

  // ---- SUCCESS RESPONSE ----
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
