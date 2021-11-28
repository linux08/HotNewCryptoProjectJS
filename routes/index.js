const express = require("express");
const router = express.Router();
const Twitter = require("../controllers/twitter");
const cron = require("node-cron");

const vcTracking = require("../vc.json");
const vcfollowing = require("../vcfollowing.json");

const { sleep, difference, removeDuplicatesString, writeToFileInVC } = require("../utils");

const { tgBot, notify } = require("../api/telegram");

const twitterCrt = new Twitter();

const filterData = (vcfollowing, vcTracking, respArray, data, i) => {
  vcfollowing.find((c) => c.userName === vcTracking[i])
    ? vcfollowing.map(async (c, i) => {

          let newInfo = difference(data.data, c.data);
          newInfo = (newInfo && newInfo.map((c) => c.profile_link)).filter((c) => c) || [];

          respArray.push({
            account: data.userName,
            newFollowing: newInfo,
          });

          if (c.userName === vcTracking) {
            return data;
          }
          return c;

      })
    : vcfollowing.push(data);

  let finalResp = JSON.parse(removeDuplicatesString(respArray));
  console.log(finalResp);
  return finalResp;
};

const sendNotification = (async = (respData) => {
  try {
    for (let j = 0; j <= respData; j++) {
      setTimeout(function () {
        notify({
          account: data.userName,
          newFollowing: newInfo,
        });
      }, i * 3000);
    }
  } catch (err) {
    console.log("Error sending notification", err.message);
  }
});

const performOperation = async () => {
  console.log("--------start");
  let respArray = [];
  let respString;
  let processedData;
  let data;
  try {
    // let error = 0;
    for (let i = 0; i < vcTracking.length; i++) {
      try {
        //Timer to delay from making the twitter api call immediately
        console.log("start", i);
        // tgBot.sendMessage("1", "---Started");
        await sleep(i > 0 && i % 15 === 0 ? 900000 : 10000);
        console.log("end", i);
        let result = await twitterCrt.getFollowing(vcTracking[i], 10);
        if (!result) {
          sleep(900000);
        }

        processedData = result.users.map((c) => {
          return {
            id: c && c.id,
            id_str: c && c.id_str,
            name: c && c.name,
            screen_name: c && c.screen_name,
            profile_link: `https://twitter.com/${c && c.screen_name}`,
            followers_count: c && c.followers_count,
            friends_count: c && c.friends_count,
            description: c && c.description,
            location: c && c.location,
          };
        });

        data = {
          userName: vcTracking[i],
          data: processedData,
          time: Date.now(),
        };

        sendNotification(filterData(vcfollowing, vcTracking, respArray, data, i));

        // respString = respArray.toString().replace(/,/g, " ").concat("\n");
      } catch (err) {
        if (err.message == "Rate limit exceeded") {
          //retry request after 15 minutes
          sendNotification(filterData(vcfollowing, vcTracking, respArray, data, i));
          await sleep(1000 * 60 * 15);
        }
      }
    }

    const jsonString = JSON.stringify(vcfollowing);
    writeToFileInVC(jsonString, "../vcfollowing.json");
  } catch (err) {
    console.log("err perfoming operation", err.message);
  }
};

performOperation();

// Schedule tasks to be run on the server.

//Run ccron job every 15 minutes
let task = cron.schedule("*/15 * * * *", function () {
  console.log("running a task every 15 minutes");
  // console.log("running a task every 3 hours = 0 0 */3 * *");
  performOperation();
});

task.start();

router.get("/vclist", async (req, res) => {
  try {
    res.send(vcTracking);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/addvc", async (req, res) => {
  try {
    if (!req.body.vc) {
      res.status(400).send({ err: "Invalid paramater" });
    }
    let vcList = vcTracking.concat(req.body.vc);
    const jsonString = JSON.stringify(vcList);
    await writeToFileInVC(jsonString, "../vc.json");
    res.send(vcList);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/removevc", async (req, res) => {
  try {
    if (!req.body.vc) {
      res.status(400).send({ err: "Invalid paramater" });
    }
    let vcList = vcTracking.filter((c) => c !== req.body.vc);
    const jsonString = JSON.stringify(vcList);
    await writeToFileInVC(jsonString, "../vc.json");
    res.send(vcList);
  } catch (err) {
    res.status(500).send(err);
  }
});

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

router.get("/ping", async (req, res) => {
  res.send("API alive and kicking");
});

router.get("/load", async (req, res) => {
  res.send("API alive and kicking");
});

/* GET home page. */
router.get("/load", async (req, res, next) => {
  let data = null;
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

module.exports = { router, performOperation };
