export interface TaskConfiguration {
    type: 'web' | 'twitter' | 'facebook';
    config: {
        url: string,
        title?: string,
        linkSelector: string,
    };
    time_interval: number;
}