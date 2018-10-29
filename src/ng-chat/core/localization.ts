export interface Localization
{
    title: string;
    messagePlaceholder: string;
    searchPlaceholder: string;
    statusDescription: StatusDescription;
    browserNotificationTitle: string;
    loadMessageHistoryPlaceholder: string;
}

export interface StatusDescription
{
    online: string;
    busy: string;
    away: string;
    offline: string;
    [key: string]: string;
}
