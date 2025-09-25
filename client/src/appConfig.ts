interface appConfig {
    baseApiUrl: string;
    externalUserId: string;
}

export const appConfig: appConfig = {
    baseApiUrl: import.meta.env.VITE_APP_SERVER_URL,
    externalUserId: import.meta.env.REACT_APP_USER_GMAIL_ID
}