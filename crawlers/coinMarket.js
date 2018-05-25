const axios = require('axios');
const moment = require('moment');
const config = require('../config');
// let instance = {
//     execute(task, axios) {

            axios.get('https://api.coinmarketcap.com/v2/global')
                .then(res => {
                    return Math.ceil(res.data.data.active_cryptocurrencies / 100);
                })
                .then(i => {
                    for(let n = 0; n < i; n++){
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
                                        volume_usd24h: coin['24h_volume_usd'],
                                        market_cap_usd: coin.market_cap_usd,
                                        available_supply: coin.available_supply,
                                        total_supply: coin.total_supply,
                                        max_supply: coin.max_supply,
                                        percent_change1h: coin.percent_change_1h,
                                        percent_change24h: coin.percent_change_24h,
                                        percent_change7d: coin.percent_change_7d,
                                        last_updated: moment(new Date(coin.last_updated*1000)).format('YYYY-MM-DD HH:mm:ss')
                                    }
                                })
                                .then((resp) => {
                                    // console.log(3);
                                    // console.log(resp,1);
                                })
                                .catch((error) => {
                                    console.log(coin.rank);
                                    // console.log(error.response.headers, 2);
                                })
                            });
                        });
                    }
                });

//     }
// };
//
// module['exports'] = instance;