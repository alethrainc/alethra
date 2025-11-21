// /api/form-submit.js
export const config = { runtime: "edge" };

export default async function handler(req) {
  const body = await req.json();

  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      From: "hello@yourdomain.com",
      To: "team@yourdomain.com",
      Subject: "New Form Submission",
      TextBody: JSON.stringify(body, null, 2)
    })
  });

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
