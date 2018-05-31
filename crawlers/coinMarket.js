const AssetFactory = require('./factory/AssetFactory');
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
                                axios.post(`${config.API_URL}/api/asset`, {
                                    asset: AssetFactory.buildAsset(res.data.data[key])
                                })
                                .then((resp) => {
                                    console.log(resp.data);
                                })
                                .catch((error) => {
                                    console.log(error.response.headers);
                                })
                            }
                        }
                    });
                }
            });
    }
};

module['exports'] = instance;