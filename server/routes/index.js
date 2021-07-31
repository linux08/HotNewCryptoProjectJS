var express = require('express');
var router = express.Router();
const twitterClient = require('../api/twitter')

/* GET home page. */
router.get('/', async(req, res, next) => {
    let search = await twitterClient.v2.get('tweets/search/recent', { query: 'nodeJS', max_results: 100 });
    console.log(search)
    return res.json({ message: "Hello from server!" });
});

module.exports = router;