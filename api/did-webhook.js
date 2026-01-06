export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // IMPORTANT: this is the raw payload from D-ID
    const payload = req.body;

    console.log("🔔 D-ID WEBHOOK RECEIVED");
    console.log(JSON.stringify(payload, null, 2));

    // For now: do NOTHING else
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Webhook failed" });
  }
}
