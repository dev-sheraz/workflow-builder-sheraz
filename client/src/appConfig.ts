/**
 * Application configuration interface
 * Defines the structure for app-wide configuration settings
 */
interface appConfig {
    baseApiUrl: string;     // Backend server URL for API calls
    externalUserId: string; // User identifier for Pipedream workflows
}

/**
 * Application configuration object
 * Contains environment-specific settings loaded from environment variables
 * Used throughout the app for API communication and user identification
 */
export const appConfig: appConfig = {
    baseApiUrl: import.meta.env.VITE_APP_SERVER_URL,        // Vite environment variable for server URL
    externalUserId: import.meta.env.REACT_APP_USER_GMAIL_ID // React environment variable for user ID
}