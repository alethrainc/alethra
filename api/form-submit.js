export const config = { runtime: "edge" };

export default async function handler(req) {
  let body = {};

  // Parse JSON safely to avoid "Unexpected end of JSON input"
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

  // ---- 1) INTERNAL EMAIL TO YOU ----
  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      From: "info@myalethra.com",
      To: "orlando@myalethra.com",
      Subject: "New Website Form Submission",
      TextBody: JSON.stringify(body, null, 2)
    })
  });

  // ---- 2) USER CONFIRMATION EMAIL ----
  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      From: "info@myalethra.com",
      To: userEmail,
      Subject: "Thanks for joining ALETHRA",
      TextBody: "Thanks for signing up! We received your information and will reach out soon."
    })
  });

  // ---- SUCCESS RESPONSE ----
  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
