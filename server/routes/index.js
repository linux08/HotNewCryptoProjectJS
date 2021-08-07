var express = require("express");
var router = express.Router();
const Twitter = require("../controllers/twitter");
const cron = require("node-cron");

// Schedule tasks to be run on the server.
cron.schedule("0 10 * * *", function () {
  console.log("running a task every minute");
});

const twitterCrt = new Twitter();

router.get("/followers", async (req, res) => {
  try {
    const resp =  await twitterCrt.getFollowers(req.body.userId);
    res.send(resp);
  } catch (err) {
    res.status(500).send(err);
  }
});


router.get("/friends-list", async (req, res) => {
  try {
    const resp = await twitterCrt.getFriendsList(req.body.userId, req.body.count || 20);
    res.send(resp);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/following", async (req, res) => {
   try {
     const resp = await twitterCrt.getFriendsOfUser(req.body.userId, req.body.count || 20);
     res.send(resp);
   } catch (err) {
     res.status(500).send(err);
   }
});

/* GET home page. */
router.get("/", async (req, res, next) => {
  var data = null;
  try {
    let cb = function (err) {
      if (err) next(err);
    };
    //  data = await twitterCrt.performFriendsUpdate(null, 10, cb)
    data = await twitterCrt.getPageData();
    return res.send({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
