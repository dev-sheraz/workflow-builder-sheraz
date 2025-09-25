import { serverClient } from "../utils/pipedream.js";

export const generateConnectToken = async (req, res) => {
  const { externalUserId } = req.body;
  try {
    if (!externalUserId) {
      return res.status(400).json({ error: "externalUserId is required" });
    }
    const response = await serverClient.tokens.create({
      externalUserId: externalUserId,
      allowedOrigins: ["http://localhost:4000", "http://localhost:5173"],
    });
    return res.json(response);
  } catch (err) {
    console.error("Error generating connect token:", err);
    res.status(500).json({
      error: "Failed to generate connect token",
      details: err.message,
    });
  }
};
