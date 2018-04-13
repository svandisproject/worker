const Twitter = require('twitter');

let instance = {
    execute(task, axios) {
        console.log(task.config);
        let client = new Twitter({
            username: task.config.username,
            consumer_key: task.config.consumerKey,
            consumer_secret: task.config.consumerSecret,
            access_token_key: task.config.accessTokenKey,
            access_token_secret: task.config.accessTokenSecret
        });

        let params = {screen_name: task.config.username};

        client.get('statuses/user_timeline', params, function(error, tweets, response) {
            if(error) {
                console.log(error)
            }
            if (!error) {
                tweets.map((tweet) => {
                    axios.post(`${config.API_URL}/api/post`, {
                        post: {
                            url: `https://twitter.com/statuses/${tweet.id}`,
                            title: tweet.text,
                            content: tweet.text,
                            source: 'twitter',
                            publishedAt: tweet.created_at,
                        },
                    });
                });
            }
        });
    }
};

module['exports'] = instance;