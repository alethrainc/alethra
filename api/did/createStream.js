export default async function handler(req, res) {
  const agentId = process.env.DID_AGENT_ID;

  const response = await fetch(
    `https://api.d-id.com/agents/${agentId}/streams`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(process.env.DID_API_KEY + ":").toString("base64"),
        "Content-Type": "application/json"
      }
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
