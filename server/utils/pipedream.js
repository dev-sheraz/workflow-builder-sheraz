/* eslint-disable no-undef */
// Load environment variables
import dotenv from "dotenv"
dotenv.config();

// Import Pipedream SDK for workflow automation
import { PipedreamClient } from "@pipedream/sdk";

/**
 * Initialize Pipedream client with server credentials
 * Used for server-side API calls to Pipedream services
 */
export const serverClient = new PipedreamClient({
  clientId: process.env.PIPEDREAM_CLIENT_ID,
  clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
  projectEnvironment: process.env.PIPEDREAM_PROJECT_ENVIRONMENT,
  projectId: process.env.PIPEDREAM_PROJECT_ID,
});

/**
 * Generate OAuth access token for Pipedream API authentication
 * @returns {Promise<string>} Access token for API requests
 */
export async function generateAccessToken() {
  const { accessToken } = await serverClient.oauthTokens.create({
    clientId: process.env.PIPEDREAM_CLIENT_ID,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
  });
  return accessToken;
}

export async function retrieveTrigger(componentId) {
  const response = await serverClient.triggers.retrieve(componentId)
  return response;
}
