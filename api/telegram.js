const { Telegraf } = require("telegraf");

const { sleep } = require("../utils");

const token = process.env.TELEGRAM_VC_BOT;

if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

global.bot = new Telegraf(process.env.TELEGRAM_VC_BOT);

bot.start((ctx) => {
  console.log("telegram bot started", ctx.update.message.chat.id);
  global.chat_id = ctx.update.message.chat.id;
  ctx.reply(`Welcome to crypto vc bot: ${process.env.ENVIRONMENT}`);


});

  //Create a telegram log transformer function
  function logToTelegram() {
    if (!global.chat_id){
      return;
    }
      try {
        //Map every argument to a string
        const msg = Object.values(arguments)
          .map((msg) => {
            if (typeof msg === "object") {
              return msg.stack ? msg.stack : JSON.stringify(msg);
            } else {
              return String(msg);
            }
          })
          .join(" ");
        //Send to mapped arguments to telegram
        console.log("at notifier", global.chat_id);
        return bot.telegram.sendMessage(global.chat_id, msg);
      } catch (err) {
        console.log(err.message);
      }
  }

//Add notify function to the console object
 async function   notify() {
   console.log('at notify');
  if (!global.chat_id) {
    return;
  }
  //Catch every exception because we don’t want exception to affect our code
  try {
    //Log the given message to the console
    // console.log(...arguments);
    logToTelegram(...arguments);
    await sleep(1000 * 60 * 5);
  } catch (e) {
    console.error(e.message);
  }
}

bot.help((ctx) => ctx.reply("Send me a sticker"));

bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => {
  console.log("pppppppp");
  console.log("ctx:-chatid", ctx.update.message.chat.id);
  ctx.reply("Hey there");
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

//Test our code
// console.notify("Hello bit4you.io");

module.exports = {
  tgBot: bot,
  notify,
};
