var express = require('express');
var router = express.Router();
const Twitter = require('../controllers/twitter')

/* GET home page. */
router.get('/', async (req, res, next) => {
 try {
    const twitterCrt = new Twitter()
    let data = await twitterCrt.getFriendsOfUser(null, 2)
    return res.send({data})   
 } catch(err) {
    next(err)
 }
});

module.exports = router;