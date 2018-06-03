export interface TaskConfiguration {
    type: 'web' | 'twitter' | 'facebook';
    config: {
        url: string,
        titleSelector: string,
        contentSelector: string,
        publishedAtSelector: string,
        dateFormat: string,
    };
    time_interval: number;
}
