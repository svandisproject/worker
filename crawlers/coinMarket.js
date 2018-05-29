const config = require('../config');
let instance = {
    execute(task, axios) {
            axios.get('https://api.coinmarketcap.com/v2/global')
                .then(res => {
                    let pages = Math.ceil(res.data.data.active_cryptocurrencies / 100);
                    for(let n = 0; n < pages; n++){
                        axios.get('https://api.coinmarketcap.com/v1/ticker?start=' + (n * 100))
                        .then((res) => {
                            res.data.map((coin) => {
                                axios.post(`${config.API_URL}/api/asset`, {
                                    asset: {
                                        name: coin.name,
                                        symbol: coin.symbol,
                                        rank: coin.rank,
                                        price_usd: coin.price_usd,
                                        price_btc: coin.price_btc,
                                        volume_usd_day: coin['24h_volume_usd'],
                                        market_cap_usd: coin.market_cap_usd,
                                        available_supply: coin.available_supply,
                                        total_supply: coin.total_supply,
                                        max_supply: coin.max_supply,
                                        percent_change_hour: coin.percent_change_1h,
                                        percent_change_day: coin.percent_change_24h,
                                        percent_change_week: coin.percent_change_7d,
                                        last_updated: coin.last_updated
                                    }
                                })
                                .then((resp) => {
                                    console.log(resp.data);
                                })
                                .catch((error) => {
                                    console.log(error.response.headers);
                                })
                            });
                        });
                    }
                });
    }
};

module['exports'] = instance;