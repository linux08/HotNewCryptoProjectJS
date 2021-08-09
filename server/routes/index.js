const express = require("express");
const router = express.Router();
const Twitter = require("../controllers/twitter");
const cron = require("node-cron");

const vcTracking = require("../vc.json");
const vcfollowing = require("../vcfollowing.json");

const { sleep, difference, removeDuplicatesString, writeToFileInVC } = require("../utils");

const tgBot = require("../api/telegram");

const twitterCrt = new Twitter();

const performOperation = async () => {
  console.log("--------");
  let respArray = [];
  // let error = 0;
  for (let i = 0; i < vcTracking.length; i++) {
    try {
      //Timer to delay from making the twitter api call immediately
      console.log("start", i);
      await sleep((i > 0 && i % 15) === 0 ? 900000 : 10000);
      console.log("end", i);
      let result = await twitterCrt.getFollowing(vcTracking[i], 10);
      if (!result) {
        sleep(900000);
      }

      const processedData = result.users.map((c) => {
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

      let data = {
        userName: vcTracking[i],
        data: processedData,
        time: Date.now(),
      };

      vcfollowing.find((c) => c.userName === vcTracking[i])
        ? vcfollowing.map((c) => {
            // get the difference between them
            // post on TG
            let newInfo = difference(data.data, c.data);
            newInfo = (newInfo && newInfo.map((c) => c.profile_link)).filter((c) => c) || [];
            respArray.push(newInfo);

            if (c.userName === vcTracking) {
              return data;
            }
            return c;
          })
        : vcfollowing.push(data);
      respArray = removeDuplicatesString(respArray);

      respString = respArray.toString().replace(/,/g, " ").concat(" ");
    } catch (err) {
      if (err.message == "Rate limit exceeded") {
         //retry request after 15 minutes
        await sleep(1000 * 60 * 15);
      }
    }
  }

  tgBot.command("track", (ctx) => {
    ctx.reply("gotcha");
    respString ? ctx.reply(respString) : null;
  });

  const jsonString = JSON.stringify(vcfollowing);
  writeToFileInVC(jsonString, "../server/vcfollowing.json");
};

performOperation();

// Schedule tasks to be run on the server.
let task = cron.schedule("0 0 */3 * *", function () {
  console.log("running a task every 3 hours");
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
    await writeToFileInVC(jsonString, "../server/vc.json");
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
    let vcList = vcTracking.filter(c => c!== req.body.vc);
    const jsonString = JSON.stringify(vcList);
    await writeToFileInVC(jsonString, "../server/vc.json");
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
   res.send("API alive and kicking")
});

/* GET home page. */
router.get("/", async (req, res, next) => {
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
