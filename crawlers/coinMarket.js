const axios = require('axios');
const moment = require('moment');
const config = require('../config');
// let instance = {
//     execute(task, axios) {

        axios.get('https://api.coinmarketcap.com/v1/ticker?limit=1')
            .then((res) => {
                res.data.map((coin) => {
                    axios.post('http://127.0.0.1:8000/api/asset', {
                    // axios.post(`${config.API_URL}/api/asset`, {
                        asset: {
                            name: coin.name,
                            symbol: coin.symbol,
                            rank: coin.rank,
                            priceUsd: coin.price_usd,
                            priceBtc: coin.price_btc,
                            volumeUsd24h: coin['24h_volume_usd'],
                            marketCapUsd: coin.market_cap_usd,
                            availableSupply: coin.available_supply,
                            totalSupply: coin.total_supply,
                            percentChange1h: coin.percent_change_1h,
                            percentChange24h: coin.percent_change_24h,
                            percentChange7d: coin.percent_change_7d,
                            lastUpdated: moment(new Date(coin.last_updated*1000)).format('YYYY-MM-DD HH:mm:ss')
                        }
                    })
                    .then((resp) => {
                        console.log(resp,1);
                    })
                    .catch((error) => {
                        console.log(error.response.headers, 2);
                    });
                })
            })
//     }
// };
//
// module['exports'] = instance;