const config = require('../config');
let instance = {
    execute(task, axios) {
            axios.get('https://api.coinmarketcap.com/v2/global')
            .then(res => {
                let pages = Math.ceil(res.data.data.active_cryptocurrencies / 100);
                for(let n = 0; n < pages; n++){
                    axios.get('https://api.coinmarketcap.com/v2/ticker?start=' + (n * 100))
                    .then((res) => {
                        for(let key in res.data.data) {
                            if(res.data.data.hasOwnProperty(key)) {
                                store(res.data.data[key]);
                            }
                        }
                    });
                }
            });

            function store(coin) {
                axios.post(`${config.API_URL}/api/asset`, {
                    asset: {
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
                })
                .then((resp) => {
                    console.log(resp.data);
                })
                .catch((error) => {
                    console.log(error.response.headers);
                })
            }
    }
};

module['exports'] = instance;