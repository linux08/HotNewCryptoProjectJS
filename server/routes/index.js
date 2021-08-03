var express = require('express');
var router = express.Router();
const Twitter = require('../controllers/twitter')

/* GET home page. */
router.get('/', async (req, res, next) => {
   var data = null
 try {
    const twitterCrt = new Twitter()
    await twitterCrt.getFriendsOfUser(null, 3)
    return res.send({data})   
 } catch(err) { 
    if (data) return res.send({data})
    next(err)
 }
});

module.exports = router;