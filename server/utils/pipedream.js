/* eslint-disable no-undef */
import dotenv from "dotenv"
dotenv.config();

import { PipedreamClient } from "@pipedream/sdk";

export const serverClient = new PipedreamClient({
  clientId: process.env.PIPEDREAM_CLIENT_ID,
  clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
  projectEnvironment: process.env.PIPEDREAM_PROJECT_ENVIRONMENT,
  projectId: process.env.PIPEDREAM_PROJECT_ID,
});

export async function generateAccessToken() {
  const { accessToken } = await serverClient.oauthTokens.create({
    clientId: process.env.PIPEDREAM_CLIENT_ID,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET,
  });
  return accessToken;
}
