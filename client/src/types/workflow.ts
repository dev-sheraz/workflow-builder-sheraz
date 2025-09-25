import type {
  App,
  V1Component,
  ConfiguredProps,
  ConfigurableProps,
  Account,
} from "@pipedream/sdk";

// Existing workflow step typing
export interface WorkflowStep {
  id: string;
  app: App;
  component: V1Component;
  stepType: "trigger" | "action";
  order: number;
  configuredProps?: ConfiguredProps<ConfigurableProps>;
  isConfigured: boolean;
}

export interface WorkflowState {
  id: string;
  name: string;
  steps: WorkflowStep[];
  currentConfiguringStepId: string | null;
}

export interface WorkflowContextType {
  workflow: WorkflowState;
  addStep: (app: App, component: V1Component) => void;
  exportWorkflow: () => void;
}

export interface WorkflowTemplate {
  template_id: string;
  run_url: string;
  payload: WorkflowPayload;
}

export interface WorkflowPayload {
  org_id: string;
  project_id: string;
  steps: WorkflowTemplateStep[];
  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;
}

export interface WorkflowTemplateStep {
  namespace: string;
  props: WorkflowStepProps;
}

export interface WorkflowStepProps {
  slack: {
    externalUserConfig: string;
  };
  conversation: string;
  text: string;
  mrkdwn: boolean;
  as_user: boolean;
  post_at: string | null;
  include_sent_via_pipedream_flag: boolean;
  customizeBotSettings: string | null;
  replyToThread: string | null;
  addMessageMetadata: string | null;
  configureUnfurlSettings: string | null;
  thread_broadcast: boolean;
  unfurl_links: boolean;
  unfurl_media: boolean;
}

export interface WorkflowTrigger {
  props: WorkflowTriggerProps;
}

export interface WorkflowTriggerProps {
  emitShape: "ERGONOMIC" | string;
  responseType: "default" | string;
  domains: string[];
  authorization: string;
  discardAutomatedRequests: boolean | null;
  staticResponseStatus: number;
  staticResponseHeaders: Record<string, string>;
  staticResponseBody: string;
  bearerToken: string;
}

export interface WorkflowSettings {
  name: string;
  auto_deploy: boolean;
}

export interface WorkflowsResponse {
  workflows: WorkflowTemplate[];
}

export interface WorkflowResponse {
  workflow: WorkflowTemplate;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface RunWorkflowRequestParams {
  id: string;
  userAccounts: Account[];
  userId: string;
}

// Response types for workflow run operations
export interface RunWorkflowResponse {
  success: boolean;
  message: string;
  emailsProcessed?: number;
  messageSent?: boolean;
}

// Response type for connect token generation
export interface ConnectTokenResponse {
  token: string;
  externalUserId: string;
  allowedOrigins: string[];
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
