import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Raw payload from D-ID
    const payload = req.body;

    console.log("🔔 D-ID WEBHOOK RECEIVED");

    // Unique S3 object key
    const key = `did/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.json`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: JSON.stringify(payload, null, 2),
        ContentType: "application/json",
      })
    );

    console.log("✅ Webhook saved to S3:", key);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ error: "Webhook failed" });
  }
}
