const Crawler       = require('simplecrawler');
const cheerio       = require('cheerio');
const redis = require('redis');
const config = require('../config');
const STATUS_SUCCESS = 1;
const moment = require('moment');

let instance = {
    execute(task, axios) {
        // let redisClient = redis.createClient();
        let crawler = Crawler(task.config.url);
        crawler.maxDepth = 2;
        crawler.maxConcurrency = 3;

            crawler.discoverResources = function (buffer, queueItem) {
                let $ = cheerio.load(buffer.toString("utf8"));
                if(task.config.publishedAtSelector === '.article-container-left-timestamp') {
                    return $(".content a[href]").map(function () {
                        return $(this).attr("href");
                    }).get();
                }
                if(task.config.publishedAtSelector === '.date') {
                    return $("#main-news a[href]").map(function () {
                        return $(this).attr("href");
                    }).get();
                }
                if(task.config.publishedAtSelector === '.entry-meta-date') {
                    return $(".mh-wrapper a[href]").map(function () {
                        return $(this).attr("href");
                    }).get();
                }
            };

        // crawler.addFetchCondition( function(queueItem) {
        //     callback(null, !redisClient.get(queueItem.url));
        // });



        crawler.on("fetchcomplete", function (queueItem, responseBuffer, response, body) {
            let data = {};
            let $ = cheerio.load(responseBuffer.toString());
            data.url = queueItem.url;
            data.title = $(task.config.titleSelector).text();
            data.content = $(task.config.contentSelector).text();
            data.source = task.config.url;

                if (task.config.publishedAtSelector === '.date') {
                    data.publishedAt = moment($(task.config.publishedAtSelector).attr('datetime')).format('YYYY-MM-DD HH:mm:ss');
                } else if (task.config.publishedAtSelector === '.article-container-left-timestamp') {
                    data.publishedAt = moment(($(task.config.publishedAtSelector).text()).substr(2, 22), task.config.dateFormat);
                } else if(task.config.publishedAtSelector === '.entry-meta-date'){
                    data.publishedAt = moment($(task.config.publishedAtSelector).text(), task.config.dateFormat);
                }

            if (data.url && data.title && data.content && data.source && data.publishedAt) {
                console.log('Valid post');
                axios.post(config.API_URL + '/api/post', { 'post': data })
                    .then(function (response) {
                        console.log(response);
                        redisClient.set(queueItem.url, STATUS_SUCCESS)
                    })
                    .catch(function (error) {
                        console.log(error.response.headers)
                        console.log(error.response.data);
                        console.log((error.response.status + ' ' + error.response.statusText).red)
                    })
                ;
            }
        });


        crawler.start();
    }
}

module['exports'] = instance;