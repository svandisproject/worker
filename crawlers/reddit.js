const snoowrap = require('snoowrap');
const axios = require('axios');
const config  = require('../config');


let instance = {
    execute(task, axios) {
        console.log(task.config);


        let r = new snoowrap({
            userAgent: 'reddit-crawler-example-app',
            clientId: task.config.clientId,
            clientSecret: task.config.clientSecret,
            username: task.config.userName,
            password: task.config.userPassword
        });
        r.getNew()
            .then(
                response=>{
                    let newRedditPosts = [];
                    response.slice(0).reverse().map(e => {

                        newRedditPosts.push({title: e.title, url: e.url, content: e.id, source: 'reddit', publishedAt: new Date(e.created_utc * 1000)})
                    });

                    return newRedditPosts;
                }
            ).then(
            newRedditPosts => {

                axios.get(config.API_URL + '/api/post/filter?source=reddit&limit=1&sort=id')
                    .then(
                        (response) => {
                            let lastRedditIdFromDB = '0';
                            if(response.data.total !== '0'){
                                lastRedditIdFromDB = response.data.rows[0].content;
                            }
                            for(let i = 0; i < newRedditPosts.length; i++){

                                if(newRedditPosts.slice(0).reverse()[i].content === lastRedditIdFromDB){
                                    console.log('breake');
                                    break
                                }else  axios.post(config.API_URL + '/api/post', {'post': newRedditPosts[i]})
                            }
                        });
            }
        );
    }

};

module['exports'] = instance;