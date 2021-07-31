const { TwitterApi } = require('twitter-api-v2');
process.env.POR

const twitterClient  = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const roClient = twitterClient.readOnly;

module.exports = twitterClient
