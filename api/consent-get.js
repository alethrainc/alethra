export default async function handler(req, res) {
  const userId = req.query.userId;
  
  // TODO: read from DB

  res.status(200).json({ consent: null });
}
