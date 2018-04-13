var casper  = require("casper").create();
var config  = require('../config');

var posts;
var currentPage = 1;
var lastPostId  = "0";

var instance = {
    execute(task, axios) {

        var parameters = '?source=facebook&limit=1&sort=id';
        casper.start(config.API_URL + '/api/post/filter' + parameters, function() {
            var page = JSON.parse(casper.getPageContent());
            if(page.total !== '0'){
                lastPostId = page.rows[0].facebook_id;
            }
        });

        casper.thenOpen('https://facebook.com/', function() {
            this.waitForSelector('form[id="login_form"]');
        });

        casper.then(function() {
            this.fillSelectors('#login_form', {
                'input[name = email]' : task.config.email,
                'input[name = pass]' : task.config.password,
            }, true);
        });

        casper.thenOpen('https://facebook.com/?sk=h_chr');//Открыть новейшее

        casper.then(function () {
            casper.waitForSelector('._4ikz', processPage, stopScript);
        });


        casper.run(function () {
            for(var i = (Object.size(posts) - 1); i >= 0; i--){
                if(posts[i].facebookId && posts[i].author && posts[i].content) {
                    axios.post(config.API_URL + '/api/post', { 'post': posts[i] });
                }
            }
        });

        function stopScript() {
            casper.then(function () {
                posts = this.evaluate(getPosts, lastPostId);
            });
            // casper.exit();
            casper.done();
        }

        function getPosts(lastPostId) {
            var newPosts = {};
            var count = 0;
            var divs = document.getElementsByTagName('div');
            loop:
                for (var i = 0; i < divs.length; i++){
                    var divsHtml = divs[i].getAttribute('id');
                    if(divsHtml) divsHtml = divsHtml.substring(18, 0);
                    if(divsHtml === 'hyperfeed_story_id'){
                        var inputs = divs[i].getElementsByTagName('input');
                        for (var j = 0; j < inputs.length; j++){
                            var name = inputs[j].getAttribute('name');
                            if (name === 'ft_ent_identifier') {
                                var fbIdPostValue = inputs[j].getAttribute('value');
                                if (fbIdPostValue == lastPostId){ // передать последний id поста из бд и прекратить цикл
                                    break loop;
                                }
                                newPosts[count] = {};
                                newPosts[count]['url'] = 'https://facebook.com/' + fbIdPostValue;
                                newPosts[count]['source'] = 'facebook';
                                //todo: publishedAt
                                newPosts[count]['publishedAt'] = 'publishedAt';
                            }
                        }

                        var postDivs = divs[i].getElementsByTagName('div');
                        for (var k = 0; k < postDivs.length; k++) {
                            var divClass = postDivs[k].getAttribute('class');
                            if (divClass === '_5x46 _1yz1 clearfix') {
                                newPosts[count]['title'] = postDivs[k].innerText;
                            } else if (divClass === '_5pbx userContent _3576') {
                                newPosts[count]['title'] += postDivs[k].innerText;
                            }else if (divClass === '_3x-2') {
                                newPosts[count]['content'] = postDivs[k].innerHTML;
                            }
                        }
                        count++
                    }
                }
            return newPosts;
        }


        function processPage() {
            if (currentPage === 25){ // сколько раз прокрутится страница вниз
                stopScript();
            }

            casper.wait(2000);
            casper.scrollToBottom();
            currentPage++;

            casper.waitForSelector("._4ikz", processPage, stopScript);
        }

        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
    }
};

module['exports'] = instance;
