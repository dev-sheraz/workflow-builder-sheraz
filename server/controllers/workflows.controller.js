/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import { serverClient } from "../utils/pipedream.js";

// Email to Slack workflow function
async function mailAttachmentToSlackChannel(
  client,
  externalUserId,
  userAccounts
) {
  try {
    if (!userAccounts || !Array.isArray(userAccounts)) {
      throw new Error("userAccounts missing or invalid in request body");
    }

    const userSlackAccount = userAccounts.find((u) =>
      u?.app?.name?.toLowerCase().includes("slack")
    );
    const userGmailAccount = userAccounts.find((u) =>
      u?.app?.name?.toLowerCase().includes("gmail")
    );

    if (!userSlackAccount || !userGmailAccount || !externalUserId) {
      throw new Error("Missing Slack, Gmail, or externalUserId");
    }

    console.log(
      `Found accounts - Gmail: ${userGmailAccount.id}, Slack: ${userSlackAccount.id}`
    );

    const response = await client.proxy.get({
      externalUserId,
      accountId: userGmailAccount.id,
      url: `/gmail/v1/users/me/messages?q=${encodeURIComponent(
        "has:attachment"
      )}&labelIds=UNREAD&maxResults=100`,
    });

    const rawEmails = [];
    const emailDetails = [];
    const uploadedFiles = [];
    let slackMessage = "";
    const attachments = [];

    if (response.messages?.length > 0) {
      console.log(
        `Found ${response.messages.length} unread messages with attachments`
      );

      for (const message of response.messages) {
        const emailDetail = await client.proxy.get({
          externalUserId,
          accountId: userGmailAccount.id,
          url: `/gmail/v1/users/me/messages/${message.id}`,
        });
        rawEmails.push(emailDetail);

        if (emailDetail.payload.parts) {
          for (const part of emailDetail.payload.parts) {
            if (part.filename && part.body?.attachmentId) {
              const attachmentData = await client.proxy.get({
                externalUserId,
                accountId: userGmailAccount.id,
                url: `/gmail/v1/users/me/messages/${message.id}/attachments/${part.body.attachmentId}`,
              });
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                fileSize: part.body.size,
                data: attachmentData.data,
              });
            }
          }
        }

        if (attachments.length > 0) {
          const subject =
            emailDetail.payload.headers.find((h) => h.name === "Subject")
              ?.value || "No Subject";
          const from =
            emailDetail.payload.headers.find((h) => h.name === "From")?.value ||
            "Unknown Sender";

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

        if (emailUploadedFiles.length > 0) {
          slackMessage += `\n*Uploaded Files:*\n`;
          for (const file of emailUploadedFiles) {
            const fileSizeKB = Math.round(file.size / 1024);
            slackMessage += `• <${file.downloadUrl}|${file.filename}> (${fileSizeKB}KB)\n`;
          }
        }

        slackMessage += `\n---\n\n`;
      }
    } else {
      slackMessage = "No new emails with attachments found.";
    }

    // Send message to Slack
    const messageResponse = await client.proxy.post({
      externalUserId,
      accountId: userSlackAccount.id,
      url: "/api/chat.postMessage",
      body: {
        channel: "#testing_workflow",
        text: slackMessage,
        mrkdwn: true,
      },
    });

    if (!messageResponse.ok) {
      console.error("Failed to send Slack message:", messageResponse.error);
    }

    // Mark emails as read
    for (const email of emailDetails) {
      try {
        await client.proxy.post({
          externalUserId,
          accountId: userGmailAccount.id,
          url: `/gmail/v1/users/me/messages/${email.messageId}/modify`,
          body: { removeLabelIds: ["UNREAD"] },
        });
      } catch (markReadError) {
        console.error(
          `Error marking email ${email.messageId} as read:`,
          markReadError
        );
      }
    }

    console.log("Email-to-Slack workflow completed successfully");
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
    console.error("Error in email-to-slack workflow:", error);
    return {
      success: false,
      error: error.message,
      emailsProcessed: 0,
    };
  }
}

// Controller handlers
export const getWorkflows = (req, res) => {
  try {
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

export const getWorkflowById = (req, res) => {
  try {
    const { id } = req.params;
    const workflowsPath = path.join(process.cwd(), "data", "workflows.json");
    const workflowsData = JSON.parse(fs.readFileSync(workflowsPath, "utf8"));

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

export const runWorkflow = async (req, res) => {
  const { userId, userAccounts } = req.body;
  const { id: workflowId } = req.params;
  try {
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!workflowId) {
      return res.status(400).json({ error: "workflow id is required" });
    }
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
    if (workflowId === "email-to-slack") {
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
    const response = await serverClient.workflows.invokeForExternalUser({
      urlOrEndpoint: workflow.run_url,
      externalUserId: userId,
      body: {
        foo: 123,
        bar: "abc",
        baz: null,
      },
    });
    return res.json({ response });
  } catch (error) {
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
