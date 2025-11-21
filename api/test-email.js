export const config = { runtime: "edge" };

export default async function handler(req) {
  // Simple test email
  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "X-Postmark-Server-Token": process.env.POSTMARK_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        From: "info@myalethra.com",   // must be a verified sender
        To: "orlando@myalethra.com",  // your email
        Subject: "Postmark Test Email",
        TextBody: "If you see this, Postmark is working!"
      })
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(`Error sending: ${text}`, { status: 500 });
    }

    return new Response("✅ Test email sent successfully!", { status: 200 });
  } catch (err) {
    return new Response(`❌ Error: ${err.message}`, { status: 500 });
  }
}
