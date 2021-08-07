var express = require("express");
var router = express.Router();
const Twitter = require("../controllers/twitter");
const cron = require("node-cron");

const fs = require("fs");
const path = require("path");


const vcTracking = require("../vc.json");

const vcfollowing = require("../vcfollowing.json");


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


// Schedule tasks to be run on the server.
cron.schedule("0 10 * * *", function () {
  console.log("running a task every minute");
});

const twitterCrt = new Twitter();

const performOperation = async () => {
  console.log("--------");
  let error = 0;
  for (let i = 0; i < vcTracking.length; i++) {
     let data = { [vcTracking[i]]: {} };
     console.log("inside loop", data);
    try {
      //Timer to delay from making the twitter api call immediately
      console.log("start",i);
      await sleep(10000);
      console.log("end",i)
      let result = await twitterCrt.getFollowing(vcTracking[i], 10);
      let data = { [vcTracking[i]]: result };
      vcfollowing.push(data);
    } catch (err) {
      console.log(err);
      break;
    }
  }

  const jsonString = JSON.stringify(vcfollowing);

  fs.writeFile(path.join(__dirname, "../vcfollowing.json"), jsonString, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully wrote file");
    }
  });
};

performOperation();

router.get("/followers", async (req, res) => {
  try {
    const resp = await twitterCrt.getFollowers(req.body.userId);
    res.send(resp);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/following", async (req, res) => {
  try {
    const resp = await twitterCrt.getFriends(req.body.userId, req.body.count || 20);
    res.send(resp);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/friendslist", async (req, res) => {
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
