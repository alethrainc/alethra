export default function handler(req, res) {
  const userId = req.query.userId;

  // TODO: Fetch audit logs for this user

  res.status(200).json({
    export: { userId, logs: [] }
  });
}
