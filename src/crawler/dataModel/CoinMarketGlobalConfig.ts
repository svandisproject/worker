export interface CoinMarketGlobalConfig {
    data: {
        active_cryptocurrencies: number,
        active_markets: number,
        bitcoin_percentage_of_market_cap: number,
        quotes: any,
        last_updated: Date,
        metadata: {
            timestamp: Date,
            error: any
        }
    };
}