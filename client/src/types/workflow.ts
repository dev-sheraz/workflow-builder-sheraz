// TypeScript type definitions for workflow-related data structures
import type {
  App,
  V1Component,
  ConfiguredProps,
  ConfigurableProps,
  Account,
} from "@pipedream/sdk";

/**
 * Represents a single step in a workflow
 * Contains app information, component details, and configuration status
 */
export interface WorkflowStep {
  id: string;                                              // Unique identifier for the step
  app: App;                                               // Pipedream app associated with this step
  component: V1Component;                                 // Pipedream component definition
  stepType: "trigger" | "action";                        // Type of workflow step
  order: number;                                          // Order of execution in the workflow
  configuredProps?: ConfiguredProps<ConfigurableProps>;  // Configured properties for the component
  isConfigured: boolean;                                  // Whether the step is fully configured
}

/**
 * Represents the current state of a workflow being built
 * Used for workflow creation and editing interfaces
 */
export interface WorkflowState {
  id: string;                           // Unique workflow identifier
  name: string;                         // Human-readable workflow name
  steps: WorkflowStep[];                // Array of workflow steps
  currentConfiguringStepId: string | null; // ID of step currently being configured
}

/**
 * Context interface for workflow state management
 * Provides methods for modifying workflow state throughout the app
 */
export interface WorkflowContextType {
  workflow: WorkflowState;                                  // Current workflow state
  addStep: (app: App, component: V1Component) => void;     // Add a new step to workflow
  exportWorkflow: () => void;                              // Export workflow configuration
}

/**
 * Represents a workflow template from the backend
 * Contains all information needed to execute a workflow
 */
export interface WorkflowTemplate {
  workflow_id: string;   // Unique workflow identifier
  template_id: string;   // Unique template identifier
  run_url: string;       // Pipedream endpoint URL for workflow execution
  payload: WorkflowPayload; // Complete workflow configuration
}

/**
 * Complete workflow payload structure
 * Contains all configuration data for a workflow
 */
export interface WorkflowPayload {
  org_id: string;                     // Organization identifier
  project_id: string;                 // Project identifier
  steps: WorkflowTemplateStep[];      // Array of workflow steps
  triggers: WorkflowTrigger[];        // Array of workflow triggers
  settings: WorkflowSettings;         // Workflow settings and metadata
}

/**
 * Represents a step in a workflow template
 * Contains the namespace and properties for the step
 */
export interface WorkflowTemplateStep {
  namespace: string;         // Step namespace/identifier
  props: WorkflowStepProps;  // Step-specific configuration properties
}

/**
 * Properties for workflow steps (specifically Slack-focused)
 * Contains all configuration options for Slack message posting
 */
export interface WorkflowStepProps {
  slack: {
    externalUserConfig: string;        // External user configuration for Slack
  };
  conversation: string;                // Slack channel/conversation ID
  text: string;                        // Message text content
  mrkdwn: boolean;                     // Enable markdown formatting
  as_user: boolean;                    // Post as user vs bot
  post_at: string | null;              // Scheduled post time
  include_sent_via_pipedream_flag: boolean; // Include Pipedream attribution
  customizeBotSettings: string | null; // Custom bot configuration
  replyToThread: string | null;        // Reply to specific thread
  addMessageMetadata: string | null;   // Additional message metadata
  configureUnfurlSettings: string | null; // URL unfurl configuration
  thread_broadcast: boolean;           // Broadcast to channel from thread
  unfurl_links: boolean;               // Auto-unfurl links in messages
  unfurl_media: boolean;               // Auto-unfurl media in messages
}

/**
 * Represents a workflow trigger configuration
 * Defines how the workflow is initiated
 */
export interface WorkflowTrigger {
  props: WorkflowTriggerProps; // Trigger-specific configuration properties
}

/**
 * Properties for workflow triggers
 * Configures how workflows are triggered and how they respond
 */
export interface WorkflowTriggerProps {
  emitShape: "ERGONOMIC" | string;           // Shape of emitted data
  responseType: "default" | string;          // Type of response to return
  domains: string[];                         // Allowed domains for webhook triggers
  authorization: string;                     // Authorization configuration
  discardAutomatedRequests: boolean | null; // Whether to discard automated requests
  staticResponseStatus: number;              // HTTP status for static responses
  staticResponseHeaders: Record<string, string>; // Headers for static responses
  staticResponseBody: string;                // Body content for static responses
  bearerToken: string;                       // Bearer token for authentication
}

/**
 * General workflow settings and metadata
 */
export interface WorkflowSettings {
  name: string;        // Human-readable workflow name
  auto_deploy: boolean; // Whether to automatically deploy workflow changes
}

/**
 * API response type for fetching multiple workflows
 */
export interface WorkflowsResponse {
  workflows: WorkflowTemplate[]; // Array of available workflow templates
}

/**
 * API response type for fetching a single workflow
 */
export interface WorkflowResponse {
  workflow: WorkflowTemplate; // Single workflow template
}

/**
 * Standard API error response structure
 */
export interface ApiError {
  error: string;   // Error type/code
  message: string; // Human-readable error message
}

/**
 * Parameters required to execute a workflow
 */
export interface RunWorkflowRequestParams {
  id: string;                 // Workflow template ID to execute
  userAccounts: Account[];    // User's connected app accounts
  userId: string;             // External user identifier
}

/**
 * Response type for workflow execution operations
 * Contains execution status and results
 */
export interface RunWorkflowResponse {
  success: boolean;           // Whether workflow execution was successful
  message: string;            // Status message or error description
  emailsProcessed?: number;   // Number of emails processed (for email workflows)
  messageSent?: boolean;      // Whether message was sent successfully (for messaging workflows)
}

/**
 * Response type for Pipedream Connect token generation
 * Used for frontend authentication with Pipedream services
 */
export interface ConnectTokenResponse {
  token: string;              // Generated connect token
  externalUserId: string;     // Associated external user ID
  allowedOrigins: string[];   // Origins allowed to use this token
}

/**
 * Generic API response wrapper
 * Provides consistent structure for all API responses
 */
export interface ApiResponse<T> {
  data?: T;        // Response data (when successful)
  error?: string;  // Error message (when failed)
  message?: string; // Additional status message
}

export interface TriggerConfig {
  active: boolean;
  componentId: string;
  configurableProps: Array<Record<string, any>>; // if you know the exact shape, we can type it better
  configuredProps: {
    gmail?: Record<string, any>;
    db?: Record<string, any>;
    timer?: Record<string, any>;
    labels?: Record<string, any>;
    withTextPayload: boolean;
  };
  createdAt: number; // Unix timestamp
  id: string;
  name: string;
  nameSlug: string;
  ownerId: string;
  updatedAt: number; // Unix timestamp
}

