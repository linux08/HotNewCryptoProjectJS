const  TwitterApi  = require('twit');

const twitterClient  = new TwitterApi({
    consumer_key: process.env.TWITTER_CONSUMER,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const roClient = twitterClient.readOnly;

module.exports = twitterClient
