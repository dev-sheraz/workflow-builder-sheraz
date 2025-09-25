// Import Pipedream server client for API operations
import { serverClient } from "../utils/pipedream.js";

/**
 * Generate a Pipedream Connect token for a user
 * This token allows frontend applications to authenticate with Pipedream services
 * on behalf of a specific external user
 *
 * @param {Object} req - Express request object containing externalUserId in body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token data or error message
 */
export const generateConnectToken = async (req, res) => {
  const { externalUserId } = req.body;
  try {
    // Validate required parameters
    if (!externalUserId) {
      return res.status(400).json({ error: "externalUserId is required" });
    }

    // Create connect token with allowed origins for CORS
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
