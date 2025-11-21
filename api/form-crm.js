// /api/form-crm.js
export default async function handler(req, res) {
  const data = req.body;

  // example CRM push
  await fetch("https://your-crm.com/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  res.status(200).json({ ok: true });
}
