export const config = { runtime: "edge" };

export default async function handler(req) {
  const body = await req.json();

  // 1) INTERNAL EMAIL (to your team)
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

  // 2) USER CONFIRMATION EMAIL (to the user)
  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      From: "info@myalethra.com",
      To: body["official-email"], // <-- user email
      Subject: "Thanks for joining ALETHRA",
      TextBody: `Thanks for signing up! We received your information and will reach out soon.`
    })
  });

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
