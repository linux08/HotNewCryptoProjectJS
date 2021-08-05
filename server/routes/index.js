var express = require('express');
var router = express.Router();
const Twitter = require('../controllers/twitter')

/* GET home page. */
router.get('/', async (req, res, next) => {
   var data = null
 try {
    const twitterCrt = new Twitter()
    let cb = function(err) {
       if(err) next(err)
    }
   //  data = await twitterCrt.performFriendsUpdate(null, 10, cb)
   data = await twitterCrt.getPageData()
   return res.send({data})   
 } catch(err) { 
    next(err)
 }
});

module.exports = router;