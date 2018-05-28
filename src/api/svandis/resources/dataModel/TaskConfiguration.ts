export interface TaskConfiguration {
    type: string;
    config: {
        url: string,
        titleSelector: string,
        contentSelector: string,
        publishedAtSelector: string,
        dateFormat: string,
    };
    time_interval: number;
}
