export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, region, choices, timestamp } = req.body;

  // TODO: Store to DB (Vercel KV / Neon / Turso)
  // For now, return OK
  return res.status(200).json({ status: "saved" });
}
