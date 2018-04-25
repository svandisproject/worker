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

                        newRedditPosts.push({title: e.title, url: e.url, content: '', source: 'reddit', publishedAt: new Date(e.created_utc * 1000)})
                    });

                    return newRedditPosts;
                }
            ).then(

            newRedditPosts => {newRedditPosts.map(post =>
                {
                    axios.post(config.API_URL + '/api/post', {'post': post})
                }
            )}
        );
    }
};

module['exports'] = instance;