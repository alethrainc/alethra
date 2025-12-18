export default async function handler(req, res) {
  const { streamId, sdp } = req.body;
  const agentId = process.env.DID_AGENT_ID;

  const response = await fetch(
    `https://api.d-id.com/agents/${agentId}/streams/${streamId}/sdp`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.DID_API_KEY + ":").toString("base64"),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sdp)
    }
  );

  res.status(200).json({ ok: true });
}