class AssetFactory {
    static buildAsset(coin) {
        return {
            name: coin.name,
            symbol: coin.symbol,
            rank: coin.rank,
            circulating_supply: coin.circulating_supply,
            total_supply: coin.total_supply,
            max_supply: coin.max_supply,
            price_usd: coin.quotes.USD.price,
            volume_usd_day: coin.quotes.USD.volume_24h,
            market_cap_usd: coin.quotes.USD.market_cap,
            percent_change_hour_usd: coin.quotes.USD.percent_change_1h,
            percent_change_day_usd: coin.quotes.USD.percent_change_24h,
            percent_change_week_usd: coin.quotes.USD.percent_change_7d,
            last_updated: coin.last_updated
        }
    }
}

module.exports = AssetFactory;