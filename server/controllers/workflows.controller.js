/* eslint-disable no-undef */
// Import required Node.js modules and utilities
import fs from "fs";
import path from "path";
import { serverClient } from "../utils/pipedream.js";

/**
 * Email to Slack workflow automation function
 * Processes unread Gmail messages with attachments and forwards them to Slack
 *
 * This function:
 * 1. Fetches unread emails with attachments from Gmail
 * 2. Downloads and uploads attachments to Slack
 * 3. Posts a formatted message to Slack with attachment details
 * 4. Marks processed emails as read
 *
 * @param {Object} client - Pipedream client instance for API calls
 * @param {string} externalUserId - External user identifier
 * @param {Array} userAccounts - Array of user's connected app accounts
 * @returns {Object} Results object with success status and processing details
 */
export async function mailAttachmentToSlackChannel(
  client,
  externalUserId,
  userAccounts
) {
  try {
    // Validate input parameters
    if (!userAccounts || !Array.isArray(userAccounts)) {
      throw new Error("userAccounts missing or invalid in request body");
    }

    // Find user's connected Slack and Gmail accounts
    const userSlackAccount = userAccounts.find((u) =>
      u?.app?.name?.toLowerCase().includes("slack")
    );
    const userGmailAccount = userAccounts.find((u) =>
      u?.app?.name?.toLowerCase().includes("gmail")
    );

    // Ensure all required accounts and user ID are present
    if (!userSlackAccount || !userGmailAccount || !externalUserId) {
      throw new Error("Missing Slack, Gmail, or externalUserId");
    }

    console.log(
      `Found accounts - Gmail: ${userGmailAccount.id}, Slack: ${userSlackAccount.id}`
    );

    // Fetch unread emails with attachments from Gmail API
    const response = await client.proxy.get({
      externalUserId,
      accountId: userGmailAccount.id,
      url: `/gmail/v1/users/me/messages?q=${encodeURIComponent(
        "has:attachment"
      )}&labelIds=UNREAD&maxResults=100`,
    });

    // Initialize data structures for processing
    const rawEmails = [];           // Raw email data from Gmail API
    const emailDetails = [];        // Processed email information
    const uploadedFiles = [];       // Files successfully uploaded to Slack
    let slackMessage = "";          // Formatted message for Slack
    const attachments = [];         // Email attachments data

    // Process emails if any are found
    if (response.messages?.length > 0) {
      console.log(
        `Found ${response.messages.length} unread messages with attachments`
      );

      // Iterate through each unread message
      for (const message of response.messages) {
        // Fetch detailed message information including attachments
        const emailDetail = await client.proxy.get({
          externalUserId,
          accountId: userGmailAccount.id,
          url: `/gmail/v1/users/me/messages/${message.id}`,
        });
        rawEmails.push(emailDetail);

        // Process email parts to find and download attachments
        if (emailDetail.payload.parts) {
          for (const part of emailDetail.payload.parts) {
            // Check if part has an attachment
            if (part.filename && part.body?.attachmentId) {
              // Download attachment data from Gmail
              const attachmentData = await client.proxy.get({
                externalUserId,
                accountId: userGmailAccount.id,
                url: `/gmail/v1/users/me/messages/${message.id}/attachments/${part.body.attachmentId}`,
              });
              // Store attachment metadata and data
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                fileSize: part.body.size,
                data: attachmentData.data,
              });
            }
          }
        }

        // Extract email metadata if attachments were found
        if (attachments.length > 0) {
          // Extract subject and sender from email headers
          const subject =
            emailDetail.payload.headers.find((h) => h.name === "Subject")
              ?.value || "No Subject";
          const from =
            emailDetail.payload.headers.find((h) => h.name === "From")?.value ||
            "Unknown Sender";

          // Store processed email information
          emailDetails.push({
            subject,
            from,
            attachments,
            messageId: message.id,
          });
        }
      }
    } else {
      console.log("No unread messages with attachments found");
    }

    if (emailDetails.length > 0) {
      slackMessage = `*New Email${
        emailDetails.length > 1 ? "s" : ""
      } Found!*\n\n`;

      for (const email of emailDetails) {
        slackMessage += `*Subject:* ${email.subject}\n`;
        slackMessage += `*From:* ${email.from}\n`;
        slackMessage += `*Attachments:* ${email.attachments.length} file(s)\n`;

        const emailUploadedFiles = [];

        for (const att of email.attachments) {
          try {
            const actualFileSize = Buffer.from(att.data, "base64").length;
            const uploadUrlResponse = await client.proxy.post({
              accountId: userSlackAccount.id,
              externalUserId: externalUserId,
              url: `https://slack.com/api/files.getUploadURLExternal?filename=${encodeURIComponent(
                att.filename
              )}&length=${actualFileSize}`,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            });

            if (!uploadUrlResponse.ok) {
              console.error(
                "Failed to get upload URL:",
                uploadUrlResponse.error
              );
              continue;
            }

            const { upload_url, file_id } = uploadUrlResponse;

            const fileBuffer = Buffer.from(att.data, "base64");
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: att.mimeType });
            formData.append("file", blob, att.filename);

            const uploadResponse = await fetch(upload_url, {
              method: "PUT",
              body: formData,
            });

            if (!uploadResponse.ok) {
              console.error(`File upload failed: ${uploadResponse.status}`);
              continue;
            }

            const completeResponse = await client.proxy.post({
              accountId: userSlackAccount.id,
              externalUserId: externalUserId,
              url: `https://slack.com/api/files.completeUploadExternal?channel_id=C09D40Y5P0R`,
              body: {
                files: [
                  {
                    id: file_id,
                    title: att.filename,
                  },
                ],
              },
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
            });

            if (!completeResponse.ok) {
              console.error(
                `Error in complete Response call: ${completeResponse.error}`
              );
              continue;
            }

            if (completeResponse.files && completeResponse.files.length > 0) {
              const uploadedFile = completeResponse.files[0];
              emailUploadedFiles.push({
                filename: uploadedFile.name || uploadedFile.title,
                fileId: uploadedFile.id,
                permalink: uploadedFile.permalink,
                downloadUrl: uploadedFile.url_private_download,
                size: uploadedFile.size,
              });
            }

            uploadedFiles.push({
              filename: att.filename,
              upload_url: upload_url,
              file_id: file_id,
              uploadResponse: completeResponse,
            });
          } catch (attachmentError) {
            console.error(
              `Error processing attachment ${att.filename}:`,
              attachmentError
            );
            continue;
          }
        }

        // Add uploaded file links to Slack message
        if (emailUploadedFiles.length > 0) {
          slackMessage += `\n*Uploaded Files:*\n`;
          for (const file of emailUploadedFiles) {
            const fileSizeKB = Math.round(file.size / 1024);
            slackMessage += `• <${file.downloadUrl}|${file.filename}> (${fileSizeKB}KB)\n`;
          }
        }

        slackMessage += `\n---\n\n`; // Separator between emails
      }
    } else {
      // Default message when no attachments are found
      slackMessage = "No new emails with attachments found.";
    }

    // Send formatted message to Slack channel
    const messageResponse = await client.proxy.post({
      externalUserId,
      accountId: userSlackAccount.id,
      url: "/api/chat.postMessage",
      body: {
        channel: "#testing_workflow", // Target Slack channel
        text: slackMessage,
        mrkdwn: true, // Enable markdown formatting
      },
    });

    if (!messageResponse.ok) {
      console.error("Failed to send Slack message:", messageResponse.error);
    }

    // Mark processed emails as read to avoid reprocessing
    for (const email of emailDetails) {
      try {
        await client.proxy.post({
          externalUserId,
          accountId: userGmailAccount.id,
          url: `/gmail/v1/users/me/messages/${email.messageId}/modify`,
          body: { removeLabelIds: ["UNREAD"] }, // Remove UNREAD label
        });
      } catch (markReadError) {
        console.error(
          `Error marking email ${email.messageId} as read:`,
          markReadError
        );
      }
    }

    console.log("Email-to-Slack workflow completed successfully");

    // Return workflow execution results
    return {
      success: true,
      emailsProcessed: emailDetails.length,
      mainResponse: response,
      emailsWithAttachments: emailDetails,
      slackUploadedData: uploadedFiles,
      slackMessage: slackMessage,
      messageSent: messageResponse.ok,
    };
  } catch (error) {
    // Handle and log workflow errors
    console.error("Error in email-to-slack workflow:", error);
    return {
      success: false,
      error: error.message,
      emailsProcessed: 0,
    };
  }
}

// =============================================================================
// WORKFLOW CONTROLLER HANDLERS
// =============================================================================
/**
 * GET /workflows - Fetch all available workflows from JSON file
 *
 * Returns a list of all workflow templates available in the system
 * Workflows are stored in data/workflows.json file
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with workflows array or error message
 */
export const getWorkflows = (req, res) => {
  try {
    // Read workflows from local JSON file
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));
    res.json({ workflows: workflowsData });
  } catch (error) {
    console.error("Error reading workflows:", error);
    res.status(500).json({
      error: "Failed to fetch workflows",
      message: error.message,
    });
  }
};

/**
 * GET /workflows/:id - Fetch a specific workflow by its template ID
 *
 * Retrieves detailed information about a single workflow template
 *
 * @param {Object} req - Express request object with id parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with workflow data or error message
 */
export const getWorkflowById = (req, res) => {
  try {
    const { id } = req.params; // Extract workflow ID from URL parameters
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));

    // Find workflow by template_id
    const workflow = workflowsData.find((wf) => wf.template_id === id);

    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found",
        message: `No workflow found with ID ${id}`,
      });
    }

    res.json({ workflow });
  } catch (error) {
    console.error("Error reading workflow:", error);
    res.status(500).json({
      error: "Failed to fetch workflow",
      message: error.message,
    });
  }
};

/**
 * POST /workflows/:id/run - Execute a specific workflow
 *
 * Runs a workflow for a specific user with their connected accounts
 * Supports custom workflow implementations and generic Pipedream workflow invocation
 *
 * @param {Object} req - Express request object with userId, userAccounts in body and id in params
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with execution results or error message
 */
export const runWorkflow = async(req, res) => {
  const { userId, userAccounts } = req.body;
  const { id: workflowId } = req.params;
  try {
    // Validate required parameters
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!workflowId) {
      return res.status(400).json({ error: "workflow id is required" });
    }
    // Load workflow configuration from JSON file
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));
    const workflow = workflowsData.find((wf) => wf.template_id === workflowId);
    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found",
        message: `No workflow found with ID ${workflowId}`,
      });
    }
    console.log(`Running workflow with id ${workflowId} for user: ${userId}`);

    // Handle custom workflow implementations
    if (workflowId === "email-to-slack") {
      // Execute custom email-to-slack workflow
      const result = await mailAttachmentToSlackChannel(
        serverClient,
        userId,
        userAccounts
      );
      if (result.success) {
        return res.json({
          success: true,
          message:
            result.emailsProcessed > 0
              ? `Successfully processed ${result.emailsProcessed} emails`
              : "No new Emails with attachments found",
          emailsProcessed: result.emailsProcessed,
          messageSent: result.messageSent,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: result.error || "Workflow failed",
          emailsProcessed: 0,
        });
      }
    }
//     const {accessToken} = await serverClient.oauthTokens.create({
//   clientId: process.env.PIPEDREAM_CLIENT_ID,
//   clientSecret: process.env.PIPEDREAM_CLIENT_SECRET
// });
    // Execute generic Pipedream workflow
    const response = await serverClient.workflows.invokeForExternalUser({
      externalUserId: userId,
      urlOrEndpoint: workflow.run_url,
    })
    return res.json({ response });
  } catch (error) {
    // Handle workflow execution errors with detailed error messages
    console.error("Error running workflow:", error);
    const message =
      error.body?.message ||
      error.rawResponse?.headers?.get("x-pd-error") ||
      error.message ||
      "Unknown error running workflow";
    return res.json({
      success: false,
      message,
    });
  }
};
