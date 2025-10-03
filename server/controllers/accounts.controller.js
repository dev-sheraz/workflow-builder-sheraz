import { serverClient } from '../utils/pipedream.js';

export const deleteAppAccountById = async (req, res) => {
  const { id: appAccountId } = req.params;
  try {
    if (!appAccountId) {
      return res.status(400).json({ message: "Workflow ID is required." });
    }
    const response = await serverClient.accounts.deleteByApp(appAccountId);
    return res.json({ data: response });
  } catch (error) {
    console.log(error);
  }
};