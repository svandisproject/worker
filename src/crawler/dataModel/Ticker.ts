export interface Ticker {
    id: number;
    name: string;
    symbol: string;
    website_slug: string;
    rank: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    quotes: any;
    last_updated: Date;
}
